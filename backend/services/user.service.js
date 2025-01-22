const User = require('../models/user.model');
const { v4: uuidv4 } = require('uuid');

module.exports.createUserService = async (userData) => {
    const existingUser = await User.findOne({ username: userData.username });
    if (existingUser) {
        return {
            success: false,
            message: 'Username already exists'
        }
    }
    try {
        const newUser = new User({
            id: uuidv4(),
            username: userData.username,
            age: userData.age,
            hobbies: userData.hobbies || []
        });

        const savedUser = await newUser.save();

        return {
            success: true,
            data: savedUser,
            message: 'User created successfully'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
}

module.exports.updateUserService = async (userId, updateData) => {
    const existingUser = await User.findOne({ id: userId });

    if (!existingUser) {
        return {
            success: false,
            message: 'User not found'
        }
    }
    // if (updateData.username !== existingUser.username) {
    //     const usernameExists = await User.findOne({ username: updateData.username });
    //     if (usernameExists) {
    //         return {
    //             success: false,
    //             message: 'Username already exists'
    //         }
    //     }
    // }
    try {
        const updatedUser = await User.findOneAndUpdate(
            { id: userId },
            {
                username: updateData.username || existingUser.username,
                age: updateData.age || existingUser.age,
                hobbies: updateData.hobbies || existingUser.hobbies
            },
            { new: true }
        );

        return {
            success: true,
            data: updatedUser,
            message: 'User updated successfully'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
}

module.exports.getAllUsersService = async () => {
    try {
        const users = await User.find({});

        return {
            success: true,
            data: users,
            message: 'Users retrieved successfully'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
}

module.exports.deleteUserService = async (userId) => {
    const existingUser = await User.findOne({ id: userId });

    if (!existingUser) {
        return {
            success: false,
            message: 'User not found'
        }
    }

    try {
        await User.findOneAndDelete({ id: userId });

        return {
            success: true,
            message: 'User deleted successfully'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
}