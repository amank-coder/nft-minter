const express = require('express');
const multer = require('multer');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json())

const upload = multer({
    limits:{
        fileSize:1000000
    }
})

const starton = axios.create({
    baseURL: "https://api.starton.io/v3",
    headers: {
        "x-api-key": "sk_live_feebc3b8-723e-4e32-949f-7ce89c4dd44b",
    },
})

app.post('/upload',cors(),upload.single('file'),async(req,res)=>{
    let data = new FormData();
    const blob = new Blob([req.file.buffer],{type:req.file.mimetype});
    data.append("file",blob,{filename:req.file.originalname})
    data.append("isSync",true);

    async function uploadImageOnIpfs(){
        const ipfsImg = await starton.post("/ipfs/file",data,{
            headers: { "Content-type": `multipart/form-data; boundary=${data._boundary}` }
        })
        return ipfsImg.data;
    }
    async function uploadMetadataOnIpfs(imgCid){
        const metadataJson={
            name: 'A wonderful NFT',
            description: 'Awesome nft',
            image: `ipfs://ipfs/${imgCid}`,
        }
        const ipfsMetadata = await starton.post("/ipfs/json",{
            name: 'My nft meta data json',
            content: metadataJson,
            isSync: true,
        })
        return ipfsMetadata.data;
    }

    const SMART_CONTRACT_NETWORK = 'polygon-mumbai';
    const SMART_CONTRACT_ADDRESS = '0x6f8D50f443bD2926a9E3cBC17462AB69eaA96C99'
    const WALLET_IMPORTED_ON_STARTON = '0x5060124dCa0a07c463d0efa55cFb2a8Ff5b8e90c'
    async function mintNFT(receiverAddress, metadataCid)
    {
        const nft = await starton.post(`/smart-contract/${SMART_CONTRACT_NETWORK}/${SMART_CONTRACT_ADDRESS}/call`,{
            functionName: 'mint',
            signerWallet: WALLET_IMPORTED_ON_STARTON,
            speed: 'low',
            params: [receiverAddress,metadataCid],
        })
        return nft.data;
    }

    const RECEIVER_ADDRESS = '0x680A882f63b150403d06491d04dB2f6CC7e8d160'
    const ipfsImgData = await uploadImageOnIpfs();
    const ipfsMetadata = await uploadMetadataOnIpfs(ipfsImgData.cid);
    const nft = await mintNFT(RECEIVER_ADDRESS, ipfsMetadata.cid)
    console.log(ipfsImgData,ipfsMetadata);
    res.status(201).json({
        transactionHash: nft.transactionHash,
        cid: ipfsImgData.cid
    })
})
app.listen(port,()=>{
    console.log(`server running at ` + port )
})