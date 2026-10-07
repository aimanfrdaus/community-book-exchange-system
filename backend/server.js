require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const db = require("./config/db");
const bookRoutes = require("./routes/bookRoutes");
const exchangeRoutes = require("./routes/exchangeRoutes");
const reportRoutes = require("./routes/reportRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const meetupRoutes = require("./routes/meetupRoutes");
const ratingRoutes = require("./routes/ratingRoutes");

console.log("DB USER:", process.env.DB_USER);
console.log("DB HOST:", process.env.DB_HOST);
console.log("DB PORT:", process.env.DB_PORT);
console.log("DB NAME:", process.env.DB_NAME);

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/exchanges", exchangeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/meetups", meetupRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/reports", reportRoutes);

app.get("/", (req, res) => {
    res.send("Community Book Exchange System API is running");
});

app.get("/test-db", (req, res) => {
    db.query("SELECT 1", (err, result) => {
        if (err) {
            console.error(
                "Database connection failed:",
                err
            );

            return res.status(500).json({
                message: "Database connection failed"
            });
        }

        res.json({
            message: "MySQL connection successful",
            result
        });
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(
        `Server running on http://localhost:${PORT}`
    );
});