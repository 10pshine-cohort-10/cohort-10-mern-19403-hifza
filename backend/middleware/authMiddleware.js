const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
    try{
        let token = req.headers.authorization;

        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token){
            return res.status(401).json({Error: "Token doesn't exists."});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();
    }
    catch(err){
        console.log("Auth Error: ", err.message);
        return res.status(401).json({Error: "Expired token or Fake token."})

    }

};