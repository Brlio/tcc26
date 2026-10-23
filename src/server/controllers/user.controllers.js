function getUsers(req, res){
    const users = req.body
    inserirUsuarios(users)
    req.status(200)
}