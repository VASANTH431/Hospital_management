const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const Doctor = require('./models/Doctor');

const fixPasswords = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const doctors = await Doctor.find({});

        for (let doc of doctors) {
            if (!doc.plainPassword) {
                doc.plainPassword = 'password123';
                const salt = await bcrypt.genSalt(10);
                // Temporarily bypass the pre-save hook by using findOneAndUpdate, or just let pre-save hook do it.
                // Wait, pre-save ONLY hashes if this.isModified('password')
                doc.password = 'password123'; // pre-save hook WILL hash this
                await doc.save();
                console.log(`Updated ${doc.id}`);
            }
        }
        console.log('Fixed passwords!');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

fixPasswords();
