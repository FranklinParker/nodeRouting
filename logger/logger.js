module.exports = {
  logAction: (method, errorLevel, user, requestInfo) => {
    console.log('method', method);
    console.log('errorLevel', errorLevel);
    console.log('user', user);
    console.log('requestInfo', requestInfo);

  },

  sanitizeErrorObj: (error)=>{
    console.log('error' + JSON.stringify(error,null,2));
    return 'error message cleaned up';
  }
}
