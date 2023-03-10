import {UserDao} from "../database/dao/userDAO";
import bcrypt from 'bcrypt';

const userDAO = new UserDao();

class UserController {

    public async createUser(req: any, res: any) {
        const randomId = Math.random().toString(32).substring(2, 8); //for test purposes
        const user = { ...req.body, id: randomId}

        const userFound = await userDAO.getUserByEmail(user.email);
        if (!userFound) {
            await userDAO.createUser(user).catch((err) => {
                console.log(err);
                res.status(500).json({ message: "Internal server error" });
            });
            res.status(200).json(user);
        } else {
            res.status(409).json({ message: "User already exists" });
        }
    }

    public async getUserById(req: any, res: any) {
        const { id } = req.params;

        const userFound = await userDAO.getUserById(id);
        if (userFound) {
            res.status(200).json(userFound);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    }

    public async getUserByEmail(req: any, res: any) {
        const { email } = req.body;

        const userFound = await userDAO.getUserByEmail(email);
        if (userFound) {
            res.status(200).json(userFound);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    }

    public async getUsers(req: any, res: any) {
        const users = await userDAO.getUsers()
        .then((users) => {
            if (users) {
                return users;
            }
            return null;
        }).catch((err) => {
            console.log(err);
            return null;
        });
        
        if (users) {
            res.status(200).json(users);
        } else {
            res.status(404).json({ message: "Users not found" });
        }
    }

    

    public async updateUser(req: any, res: any) {
        const user = req.body;
        Object.assign(user, { id: req.params.id });
        try {
            const userFound = await userDAO.getUserById(user.id);
            if (userFound.password !== user.password) {
                const newPassword = await bcrypt.hash(user.password, 10);
                Object.assign(user, { password: newPassword });
            }
            await userDAO.updateUser(user);
            res.status(200).json({ message: "User updated" });
        }
        catch {
            res.status(404).json({ message: "User not found" });
        }
    }

    public async deleteUser(req: any, res: any) {
        try {
            await userDAO.deleteUser(req.params.id);
            res.status(200).json({ message: "User deleted" });
        }
        catch {
            res.status(404).json({ message: "User not found" });
        }
    }
    
}

export {UserController}

