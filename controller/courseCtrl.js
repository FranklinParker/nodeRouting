const courses = [
  {
    courseId: "1",
    courseName: 'US history',
    professor: 'Jim Brown',
    classSchedule: 'M TH 9-11 AM'
  },
  {
    courseId: "2",
    courseName: 'Spanish',
    professor: 'Jose Cortez',
    classSchedule: 'T TH 10-11:30 AM'
  }
]

var getCourses = (params) => {
  return new Promise(function(resolve, reject) {
    console.log(' in getCourses params ', params);
    resolve(courses);
    // reject({error: 'test error logging'});
  });
};

var addCourse = (params) => {
  return new Promise(function(resolve, reject) {
    console.log(' in add course params ', params.actionData);
    resolve({
      status: 'success',
      message: ' Added course',
      data: params.actionData
    });
    //reject('test');
  });
};

var getCourseDetail= (requestData)=>{
  return new Promise(function(resolve, reject) {
    console.log(' getCourseDetail courseId: '  , requestData.query.courseId);
    const course = courses.find( course=> course.courseId === requestData.query.courseId);

    resolve({
      status: 'success',
      message: ' got course',
      data: course
    });
  });
};


module.exports.courses = {
  getCourses,
  addCourse,
  getCourseDetail
}
