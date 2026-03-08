import * as fs from 'fs';
import { parse } from 'csv-parse/sync';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import {
    Timestamp,
    addDoc,
    collection,
    getDocs,
    serverTimestamp,
    type DocumentData,
    type Firestore,
} from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

type CsvRow = Record<string, string | undefined>;

const argv = yargs(hideBin(process.argv))
    .option('username', {
        type: 'string',
        demandOption: true,
        describe: 'firebase auth email/username',
    })
    .option('password', {
        type: 'string',
        demandOption: true,
        describe: 'firebase auth password',
    })
    .option('incomes', {
        type: 'string',
        demandOption: true,
        describe: 'csv file path for incomes',
    })
    .option('expenses', {
        type: 'string',
        demandOption: true,
        describe: 'csv file path for expenses',
    })
    .option('investments', {
        type: 'string',
        demandOption: true,
        describe: 'csv file path for investments',
    })
    .strict()
    .parseSync();

const normalizeName = (value: string): string => value.trim().toLowerCase();

const cleanupNotionRelationValue = (value?: string): string => {
    if (!value) return '';

    return value
        .replace(/\s*\([^)]*\)\s*$/g, '')
        .trim();
};

const getValue = (row: CsvRow, keys: string[]): string => {
    for (const key of keys) {
        const value = row[key];
        if (value && value.trim().length > 0) {
            return value.trim();
        }
    }

    return '';
};

const parseAmount = (raw: string, context: string): number => {
    const normalized = raw.replace(/[, ]/g, '').replace(/[^\d.-]/g, '');
    const parsed = Number(normalized);

    if (Number.isNaN(parsed)) {
        throw new Error(`Invalid amount "${raw}" (${context})`);
    }

    return parsed;
};

const parseMonthKey = (raw?: string): string | null => {
    if (!raw) return null;
    const trimmed = raw.trim();
    if (!trimmed) return null;

    const yyyyMm = /^(\d{4})-(\d{2})$/;
    if (yyyyMm.test(trimmed)) return trimmed;

    const mmYyyy = /^(\d{1,2})[/-](\d{4})$/;
    const mmMatch = trimmed.match(mmYyyy);
    if (mmMatch) {
        const month = Number(mmMatch[1]);
        const year = Number(mmMatch[2]);
        if (month >= 1 && month <= 12) {
            return `${year}-${String(month).padStart(2, '0')}`;
        }
    }

    const parsedDate = new Date(trimmed);
    if (!Number.isNaN(parsedDate.getTime())) {
        const year = parsedDate.getUTCFullYear();
        const month = String(parsedDate.getUTCMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    }

    return null;
};

const parseDate = (raw?: string): Date | null => {
    if (!raw) return null;
    const trimmed = raw.trim();
    if (!trimmed) return null;

    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) return parsed;

    const slashDate = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/;
    const match = trimmed.match(slashDate);
    if (match) {
        const a = Number(match[1]);
        const b = Number(match[2]);
        const year = Number(match[3]);

        const day = a > 12 ? a : b;
        const month = a > 12 ? b : a;

        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            return new Date(Date.UTC(year, month - 1, day));
        }
    }

    return null;
};

const resolveDateAndMonthKey = (
    dateRaw: string,
    monthRaw: string,
    context: string,
): { date: Date; monthKey: string } => {
    const dateFromDate = parseDate(dateRaw);
    const monthFromMonth = parseMonthKey(monthRaw);

    if (dateFromDate) {
        const monthKey =
            monthFromMonth ??
            `${dateFromDate.getUTCFullYear()}-${String(dateFromDate.getUTCMonth() + 1).padStart(2, '0')}`;
        return { date: dateFromDate, monthKey };
    }

    if (monthFromMonth) {
        const [year, month] = monthFromMonth.split('-').map(Number);
        return {
            date: new Date(Date.UTC(year, month - 1, 1)),
            monthKey: monthFromMonth,
        };
    }

    throw new Error(`Unable to parse date/month (${context})`);
};

const readCsv = (filePath: string): CsvRow[] => {
    const data = fs.readFileSync(filePath, 'utf8');
    return parse(data, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
    }) as CsvRow[];
};

const defaultColors = {
    expenseCategory: '#4CAF50',
    incomeSource: '#2E7D32',
    paymentMethod: '#9E9E9E',
} as const;

const main = async () => {
    const firebaseConfig = {
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    };

    for (const [key, value] of Object.entries(firebaseConfig)) {
        if (!value) {
            throw new Error(`Missing env variable for Firebase config: ${key}`);
        }
    }

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);

    const expenses = readCsv(argv.expenses);
    const incomes = readCsv(argv.incomes);
    const investments = readCsv(argv.investments);

    const { user } = await signInWithEmailAndPassword(auth, argv.username, argv.password);
    const uid = user.uid;

    console.log(`Authenticated as ${argv.username}, uid=${uid}`);
    console.log(`Loaded rows -> expenses: ${expenses.length}, incomes: ${incomes.length}, investments: ${investments.length}`);

    const relationLookups = {
        expenseCategories: await loadLookupByName(db, uid, 'expenseCategories'),
        paymentMethods: await loadLookupByName(db, uid, 'paymentMethods'),
        incomeSources: await loadLookupByName(db, uid, 'incomeSources'),
        investmentTypes: await loadLookupByName(db, uid, 'investmentTypes'),
    };

    const paymentMethodName = 'N/A';
    const paymentMethodId = await getOrCreateByName({
        db,
        uid,
        tableName: 'paymentMethods',
        lookup: relationLookups.paymentMethods,
        name: paymentMethodName,
        payload: {
            name: paymentMethodName,
            color: defaultColors.paymentMethod,
            isArchived: false,
            createdAt: serverTimestamp(),
        },
    });

    const summary = {
        expenses: { imported: 0, skipped: 0 },
        incomes: { imported: 0, skipped: 0 },
        investments: { imported: 0, skipped: 0 },
    };

    for (let index = 0; index < expenses.length; index += 1) {
        const row = expenses[index];
        try {
            const name = getValue(row, ['Name']);
            const amount = parseAmount(getValue(row, ['Amount']), `expense row ${index + 1}`);
            const categoryName = cleanupNotionRelationValue(getValue(row, ['Category']));
            const { date, monthKey } = resolveDateAndMonthKey(
                getValue(row, ['Date']),
                getValue(row, ['Month']),
                `expense row ${index + 1}`,
            );

            if (!categoryName) {
                throw new Error(`Missing expense category (row ${index + 1})`);
            }

            const categoryId = await getOrCreateByName({
                db,
                uid,
                tableName: 'expenseCategories',
                lookup: relationLookups.expenseCategories,
                name: categoryName,
                payload: {
                    name: categoryName,
                    color: defaultColors.expenseCategory,
                    isArchived: false,
                    createdAt: serverTimestamp(),
                },
            });

            await addDoc(collection(db, 'users', uid, 'expenses'), {
                amount,
                category: { id: categoryId, name: categoryName },
                paymentMethod: { id: paymentMethodId, name: paymentMethodName },
                description: name || undefined,
                date: Timestamp.fromDate(date),
                monthKey,
                createdAt: serverTimestamp(),
            });

            summary.expenses.imported += 1;
        } catch (error) {
            summary.expenses.skipped += 1;
            console.error(`Skipping expense row ${index + 1}:`, error);
        }
    }

    for (let index = 0; index < incomes.length; index += 1) {
        const row = incomes[index];
        try {
            const name = getValue(row, ['Name']);
            const amount = parseAmount(getValue(row, ['Amount']), `income row ${index + 1}`);
            const sourceName = cleanupNotionRelationValue(getValue(row, ['Source']));
            const { date, monthKey } = resolveDateAndMonthKey(
                getValue(row, ['Date']),
                getValue(row, ['Date Month', 'Month']),
                `income row ${index + 1}`,
            );

            if (!sourceName) {
                throw new Error(`Missing income source (row ${index + 1})`);
            }

            const sourceId = await getOrCreateByName({
                db,
                uid,
                tableName: 'incomeSources',
                lookup: relationLookups.incomeSources,
                name: sourceName,
                payload: {
                    name: sourceName,
                    color: defaultColors.incomeSource,
                    isArchived: false,
                    createdAt: serverTimestamp(),
                },
            });

            await addDoc(collection(db, 'users', uid, 'incomes'), {
                amount,
                source: { id: sourceId, name: sourceName },
                description: name || undefined,
                date: Timestamp.fromDate(date),
                monthKey,
                createdAt: serverTimestamp(),
            });

            summary.incomes.imported += 1;
        } catch (error) {
            summary.incomes.skipped += 1;
            console.error(`Skipping income row ${index + 1}:`, error);
        }
    }

    for (let index = 0; index < investments.length; index += 1) {
        const row = investments[index];
        try {
            const investmentName = getValue(row, ['Name']);
            const amount = parseAmount(getValue(row, ['Amount']), `investment row ${index + 1}`);
            const investmentTypeName = cleanupNotionRelationValue(
                getValue(row, ['Investment Option']),
            );
            const { date, monthKey } = resolveDateAndMonthKey(
                getValue(row, ['Date']),
                getValue(row, ['Month']),
                `investment row ${index + 1}`,
            );

            if (!investmentTypeName) {
                throw new Error(`Missing investment type (row ${index + 1})`);
            }

            const investmentTypeId = await getOrCreateByName({
                db,
                uid,
                tableName: 'investmentTypes',
                lookup: relationLookups.investmentTypes,
                name: investmentTypeName,
                payload: {
                    name: investmentTypeName,
                    isArchived: false,
                    createdAt: serverTimestamp(),
                },
            });

            await addDoc(collection(db, 'users', uid, 'investments'), {
                name: investmentName || 'Untitled Investment',
                amount,
                type: { id: investmentTypeId, name: investmentTypeName },
                date: Timestamp.fromDate(date),
                monthKey,
                createdAt: serverTimestamp(),
            });

            summary.investments.imported += 1;
        } catch (error) {
            summary.investments.skipped += 1;
            console.error(`Skipping investment row ${index + 1}:`, error);
        }
    }

    console.log('Migration complete.');
    console.log(`Expenses -> imported: ${summary.expenses.imported}, skipped: ${summary.expenses.skipped}`);
    console.log(`Incomes -> imported: ${summary.incomes.imported}, skipped: ${summary.incomes.skipped}`);
    console.log(`Investments -> imported: ${summary.investments.imported}, skipped: ${summary.investments.skipped}`);
};

const loadLookupByName = async (
    db: Firestore,
    uid: string,
    tableName: string,
): Promise<Map<string, string>> => {
    const docs = await getDocs(collection(db, 'users', uid, tableName));
    const lookup = new Map<string, string>();

    docs.forEach((docSnap) => {
        const data = docSnap.data() as DocumentData;
        const name = typeof data.name === 'string' ? data.name.trim() : '';
        if (name) {
            lookup.set(normalizeName(name), docSnap.id);
        }
    });

    return lookup;
};

const getOrCreateByName = async ({
    db,
    uid,
    tableName,
    lookup,
    name,
    payload,
}: {
    db: Firestore;
    uid: string;
    tableName: string;
    lookup: Map<string, string>;
    name: string;
    payload: DocumentData;
}): Promise<string> => {
    const normalized = normalizeName(name);
    const existingId = lookup.get(normalized);
    if (existingId) return existingId;

    const created = await addDoc(collection(db, 'users', uid, tableName), payload);
    lookup.set(normalized, created.id);
    return created.id;
};

main().catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
});
