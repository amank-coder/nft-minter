import { useState } from "react";

const FileUpload=()=>{
    const [file, setFile] = useState(null)
    const [cid, setCid] = useState("");
    const [transactionHash, setTransactionHash] = useState("")
    const handleSubmit = async(event)=>{
        event.preventDefault();
        try{
            if(file){
                const formData = new FormData();
                formData.append("file",file);
                const response = await fetch('http://localhost:5000/upload',{
                    method:'POST',
                    body: formData
                }).then(response=>response.json())
                .then(data=>{
                    console.log(data)
                    setCid(data.cid);
                    setTransactionHash(data.transactionHash);
                })
                .catch(error=>{
                    console.log(error)
                })

            }
        }catch(err){
            console.log(err)
        }
    }
    const retrieveFile = (event)=>{
        try{
            const data = event.target.files[0];
            setFile(data)
            event.preventDefault();
        }catch(error){
            alert(error)
        }
    }
    
    return(
        <>
            <div className="imgCtr">
            {cid && <a href={`https://${cid}.ipfs.dweb.link`} target="_blank">
                <img src={`https://${cid}.ipfs.dweb.link`} height="250px" />
            </a>}
        </div>
        <div className="transaction">
            {transactionHash && <a href={`https:mumbai.polygonscan.com/tx/${transactionHash}`} target="_blank">
                Transaction
            </a>}
        </div>
        <div className="form">
            <form onSubmit={handleSubmit}>
                <input type="file" className="choose" onChange={retrieveFile}/>
                <button className="btn">NFT minter</button>
            </form>
        </div>
        </>
        
    )
}

export default FileUpload;