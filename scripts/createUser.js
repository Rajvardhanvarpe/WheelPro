// Script to create a Firebase user for testing
// Run this with: node scripts/createUser.js

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

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
const auth = getAuth(app);

// Change these credentials as needed
const email = 'admin@wheeltrack.pro';
const password = 'Admin@123';

async function createUser() {
    try {
        console.log('Creating user with email:', email);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('✅ User created successfully!');
        console.log('User ID:', userCredential.user.uid);
        console.log('Email:', userCredential.user.email);
        console.log('\n📝 You can now log in with:');
        console.log('Email:', email);
        console.log('Password:', password);
    } catch (error) {
        console.error('❌ Error creating user:', error.code, error.message);
        if (error.code === 'auth/email-already-in-use') {
            console.log('\n✅ User already exists! You can log in with:');
            console.log('Email:', email);
            console.log('Password:', password);
        }
    }
    process.exit(0);
}

createUser();
