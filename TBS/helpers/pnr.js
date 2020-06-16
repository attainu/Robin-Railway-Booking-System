import num from 'crypto-random-string'

const pnr = num({length:10,type:'numeric'})

module.exports= pnr