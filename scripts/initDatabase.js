// Firebase Database Initialization Script
// Run this once to set up your Firestore collections with sample data

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyC-p3fzjNPhKWxO0rRdtM62Fue-jotnBv4",
    authDomain: "wheelpro-b8407.firebaseapp.com",
    projectId: "wheelpro-b8407",
    storageBucket: "wheelpro-b8407.firebasestorage.app",
    messagingSenderId: "429846898826",
    appId: "1:429846898826:web:a4b670e06379f7d3b6a573",
    measurementId: "G-J7HFGW4GRN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample truck data
const sampleTrucks = [
    {
        truckNumber: 'ABC-9821',
        owner: 'FastTrack Logistics',
        ownerPhone: '+91-9876543210',
        driver: 'Marcus Sterling',
        currentKM: 124500,
        type: 'Heavy Duty',
        status: 'OK',
        nextDueDate: '2026-03-15',
        lastAlignmentDate: '2026-01-15',
        createdAt: Timestamp.now()
    },
    {
        truckNumber: 'XYZ-4420',
        owner: 'Prime Haulage Co.',
        ownerPhone: '+91-9876543211',
        driver: 'Elena Rodriguez',
        currentKM: 89240,
        type: 'Semi-Trailer',
        status: 'OK',
        nextDueDate: '2026-02-20',
        lastAlignmentDate: '2025-12-20',
        createdAt: Timestamp.now()
    },
    {
        truckNumber: 'TRK-0091',
        owner: 'BuildDirect Inc.',
        ownerPhone: '+91-9876543212',
        driver: 'Sam Wilson',
        currentKM: 211005,
        type: 'Flatbed',
        status: 'Due Soon',
        nextDueDate: '2026-02-12',
        lastAlignmentDate: '2025-11-12',
        createdAt: Timestamp.now()
    }
];

// Sample alignment data
const sampleAlignments = [
    {
        truckId: 'ABC-9821', // This will need to be updated with actual doc IDs
        truckNumber: 'ABC-9821',
        alignmentDate: '2026-01-15',
        currentKM: 120000,
        nextDueDate: '2026-03-15',
        technician: 'John Doe',
        notes: 'Regular alignment service',
        createdAt: Timestamp.now()
    }
];

async function initializeDatabase() {
    try {
        console.log('Initializing Firestore database...');

        // Add trucks
        console.log('Adding sample trucks...');
        for (const truck of sampleTrucks) {
            const docRef = await addDoc(collection(db, 'trucks'), truck);
            console.log(`Added truck: ${truck.truckNumber} with ID: ${docRef.id}`);
        }

        // Add alignments
        console.log('Adding sample alignments...');
        for (const alignment of sampleAlignments) {
            const docRef = await addDoc(collection(db, 'alignments'), alignment);
            console.log(`Added alignment for truck: ${alignment.truckNumber} with ID: ${docRef.id}`);
        }

        console.log('Database initialization complete!');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

// Run the initialization
initializeDatabase();
