const mongoose = require("mongoose");
const dns = require("dns");

const connectDB = async () => {
    try {
        if (process.env.MONGO_URI && process.env.MONGO_URI.startsWith("mongodb+srv")) {
            try {
                const hostPart = process.env.MONGO_URI.split("@")[1]?.split("/")[0]?.split("?")[0];
                if (hostPart) {
                    await new Promise((resolve, reject) => {
                        dns.resolveSrv(`_mongodb._tcp.${hostPart}`, (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
                }
            } catch (srvErr) {
                console.warn("DNS SRV resolution failed with default resolver. Switching to public DNS servers (8.8.8.8, 1.1.1.1)...");
                try {
                    dns.setServers(["8.8.8.8", "1.1.1.1"]);
                } catch (setErr) {
                    console.error("Failed to set public DNS servers:", setErr);
                }
            }
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");
    } catch (error) {
        console.error("Error connecting to MongoDB", error);
        process.exit(1);
    }
};

module.exports = connectDB;