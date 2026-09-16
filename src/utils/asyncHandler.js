// a way with try catch 
// const asyncHandler = (requestHandler) => async (req,res,next) => {
//     try {
//         await requestHandler(req,res,next);
//     } catch (error) {
//         res.status(500)
//         console.error(error)
//     }
// }

// way to define a async handler with promises
const asyncHandler = (requestHandler) => {
  return (req,res,next) => {
    Promise.resolve(
        requestHandler(req,res,next)
    ).catch((error) => next(error))
  }
}

export {asyncHandler};