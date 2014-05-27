module.exports = {
  knox: {
      settings: {
        key: process.env.AWS_ACCESS_KEY_ID,
        secret: process.env.AWS_SECRET_ACCESS_KEY,
        bucket: 'selfiequestdev'
      }
  },
  aws: {
    targetFolder: process.env.AWS_FOLDER || "default"
  }
};
