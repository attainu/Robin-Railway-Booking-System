
function range(start, end) {
    return Array(end - start + 1).fill().map((_, idx) => start + idx)
  }
  var result = range(1, 101); 
//   console.log(result);
const noOfSeats = result.length
// console.log(noOfSeats)
module.exports =noOfSeats