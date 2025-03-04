const adminAuth = (req, res, next) => {
  const adminKey = req.headers['admin-key'];
  
  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({
      success: false,
      message: '관리자 인증이 필요합니다.'
    });
  }

  next();
};

module.exports = adminAuth; 