// const pool = require('../database/db');

// async function search_products(searchTerm) {
//   try {
//     const searchTermsArray = searchTerm.split(' ');

//     const whereClause = searchTermsArray.map((term, index) => {
//       return skills = name ILIKE $${index + 1};
//     }
//     ).join(' OR ');

//     const query = {
//       text: SELECT * FROM products WHERE ${whereClause},
//       values: searchTermsArray.map(term => %${term}%),
//     };
    
//     const result = await pool.query(query);
//     return result.rows;
    
//   } catch (error) {
//     // console.error('Error executing query', error);
//     throw new Error('Internal Server Error');
//   }
// }

// module.exports = {
//     search_products,
// };