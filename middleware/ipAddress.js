

// function checkIPAdress(req, res, next) {
//       const ipAddress = req.ip;
//   //Saving user IP address in redis/Rate-Limiting Logic to check the request count before processing the request.
//   if (redisClient.get(ipAddress) === null) {
//     //redis does not have this address as a key
//     //set address as a key and 1 as the value and expiration as 1 hour
//     redisClient.setEx(ipAddress, 3600, 1);
//   } else if (redisClient.get(ipAddress) < 100) {
//     //else if redis does have this key
//     //is the value < 100
//     //then delete key,
//     redisClient.del(ipAddress);
//     //create it again with an increment of 1 and update expire time
//     redisClient.set(
//       ipAddress,
//       redisClient.ttl(ipAddress),
//       redis.get(ipAddress) + 1
//     );
//   }
//   //else user is capped
// }


// module.exports = {checkIPAdress};