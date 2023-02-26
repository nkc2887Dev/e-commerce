const { default: mongoose } = require("mongoose");

const dbConnect = () => {
  try {
      mongoose.set('strictQuery', true);
      const conn = mongoose.connect(process.env.MONGODB_URL)
      console.log("MongoDB Successfully Connected")
  } catch (error) {
      console.log("MongoDB Not Connected", "reason : ", error )
  }
};

module.exports = dbConnect;
