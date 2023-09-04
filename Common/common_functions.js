
// Create a function to check if a member is already in the workspace
const isMemberInWorkspace = (members, userId) => {
    return members.some(member => member.user.toString() === userId.toString());
}

module.exports = {isMemberInWorkspace}