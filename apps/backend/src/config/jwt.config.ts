export default () => ({
    jwt:{
        secret: process.env.JWT_SECRET,
        at:{
            secret: process.env.AT_SECRET,
            expiresIn: process.env.AT_EXPIRES_IN,
        },
        rt:{
            secret: process.env.RT_SECRET,
            expiresIn: process.env.RT_EXPIRES_IN,
        },
    }
})