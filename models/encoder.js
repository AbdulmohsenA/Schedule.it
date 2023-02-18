function encoder(id){
    return id.split("").reverse().join("");
}

module.exports = encoder