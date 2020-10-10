exports.getBaseUrl = (curUrl) => {

    if (curUrl === "/"){
        return "/"
    }else{
        let mainUrlPart = "", entireUrl = curUrl.split("/")
    
        for (let index = 0; index < entireUrl.length; index++) {
            let tmp = entireUrl[index]
            if ( tmp.match(/\?page=[0-9]+/) ){
                break
            }
            if (tmp === ""){
                mainUrlPart += "/"
            }else{
                mainUrlPart += tmp + "/"
            }
        }
        return mainUrlPart
    }
}