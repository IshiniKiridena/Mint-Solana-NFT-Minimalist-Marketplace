import { WalletAdapterNetwork, WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@solana/wallet-adapter-react-ui/lib/types/Button';
import '../src/css/mintButton.css'
import '../src/css/mintDiv.css'
import '../src/css/bootstrap.css'
import {
    GlowWalletAdapter,
    LedgerWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter,
    SolletExtensionWalletAdapter,
    SolletWalletAdapter,
    TorusWalletAdapter,

} from '@solana/wallet-adapter-wallets';
import fs from "fs";

import './css/card.css'
import db from './firebase.js';
import {getDocs, DocumentData, doc, FieldValue, query, collection, where, updateDoc, serverTimestamp, addDoc} from 'firebase/firestore';

import { clusterApiUrl, Transaction, SystemProgram, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import React, { FC, ReactNode, useMemo, useCallback, useState, useEffect } from 'react';

import { actions, utils, programs, NodeWallet, Connection} from '@metaplex/js'; 

import {getAuth, signInAnonymously, onAuthStateChanged} from 'firebase/auth';
import { abort } from 'process';
import { checkServerIdentity } from 'tls';
import { sign } from 'crypto';



require('./App.css');
require('@solana/wallet-adapter-react-ui/styles.css');
let thelamports = 0;
let theWallet = "9m5kFDqgpf7Ckzbox91RYcADqcmvxW4MmuNvroD5H2r9"
function getWallet(){

    
}
const App: FC = () => {


    return (
        <Context>
            <Content />
        </Context>
    );
};


export default App;

const Context: FC<{ children: ReactNode }> = ({ children }) => {


    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const network = WalletAdapterNetwork.Mainnet;

    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
    // Only the wallets you configure here will be compiled into your application, and only the dependencies
    // of wallets that your users connect to will be loaded.
    const wallets = useMemo(
        () => [
            new LedgerWalletAdapter(),
            new PhantomWalletAdapter(),
            new GlowWalletAdapter(),
            new SlopeWalletAdapter(),
            new SolletExtensionWalletAdapter(), 
            new SolletWalletAdapter(),
            new SolflareWalletAdapter({ network }),
            new TorusWalletAdapter(),
        ],
        [network]
    );

   

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

const Content: FC = () => {
    let [lamports, setLamports] = useState(.1);
    let [wallet, setWallet] = useState("9m5kFDqgpf7Ckzbox91RYcADqcmvxW4MmuNvroD5H2r9");
    let [notMinted, setNotMinted] = useState<DocumentData>([])
    let [uid, setUid] = useState("");
    let [totalI, setTotalI] = useState(9);
    let [percentageSold, setPercentageSold] = useState("0%")
    let [mintCost, setMintCost] = useState(.03)
    let [availableForMint, setAvailableForMint] = useState(0)
    let [alreadyMinted, setAlreadyMinted] = useState(0)
    let [quantityForMint, setQuantityForMint] = useState(1)
    let [quantityForMintUpdate, setQuantityForMintUpdate] = useState(1)
    let [nftCollection, setNftCollection] = useState("cryptography_punks")
    let [pk, setPk] = useState("")

    // const { connection } = useConnection();
    const connection = new Connection(clusterApiUrl("mainnet-beta"))
    const { publicKey, sendTransaction } = useWallet();
    ///collection/cryptography_punks
    const q = query(collection(db, "nfts/collection/"+nftCollection), where("minted", "==", false));



    //get minted=false
    useEffect(() => {

        const getNFTs = async () => {
          const auth = getAuth();
      
          const data = await getDocs(q);
          setNotMinted(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
          availableForMint = data.docs.length
          setAvailableForMint(availableForMint)
          console.log("availableForMint: "+data.docs.length)

          alreadyMinted = totalI - data.docs.length
          let percentageSoldI = Math.ceil((alreadyMinted/totalI)*100)
          percentageSold = percentageSoldI+"%"
          setPercentageSold(percentageSold)
          setAlreadyMinted(alreadyMinted)

          

        // get NFTS that has the user and are valid
      
        signInAnonymously(auth)
          .then(() => {
            // Signed in..
            console.log("signedIn");
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            // ...
          });
      
        //save UID
      onAuthStateChanged(auth, (user) => {
        if (user) {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/firebase.User
          const uid = user.uid;
          setUid(uid);
          setUI();
          // ...
        } else {
          // User is signed out
          // ...
        }
      });
      
        
        };
      
        getNFTs();
    }, []);


    async function setUI() {

        
    }

    async function increment(){
      if (quantityForMint >= availableForMint){

      }else{
        quantityForMint += 1;
        setQuantityForMint(quantityForMint);
        console.log("qty for mint:"+ quantityForMint)
      }

    }
    async function decrement(){
      if (quantityForMint<=1){

      }else{
        quantityForMint -= 1;
        setQuantityForMint(quantityForMint);
        console.log("qty for mint:"+ quantityForMint)

      }
      
    }


    async function onClickGo(){
      onClick(notMinted);
    }

    const onClick = useCallback( async (notMinted) => {

        if (!publicKey) throw new WalletNotConnectedError();
        connection.getBalance(publicKey).then((bal) => {
            console.log(bal/LAMPORTS_PER_SOL);
            pk = publicKey.toBase58();
            setPk(pk)


        });
        let lamportsToMintI = quantityForMint*mintCost*LAMPORTS_PER_SOL;
        let lamportsI = LAMPORTS_PER_SOL*lamports;
        console.log(publicKey.toBase58());
        console.log("lamports sending: {}", thelamports)

        console.log("lamportsToMintI: "+lamportsToMintI)
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: new PublicKey(theWallet),
                lamports: lamportsToMintI,
            })
        );



        const signature = await sendTransaction(transaction, connection);

        await connection.confirmTransaction(signature, 'processed');

        

        //GET ALL minted=false doc.ids

const q = query(collection(db, "nfts/collection/"+nftCollection), where("minted", "==", false));

//update doc.ids to set minted=true
let docIdsForMintedTrue: string[] = [];
const querySnapshot = await getDocs(q);
querySnapshot.forEach((doc) => {
  docIdsForMintedTrue.push(doc.id)
  // doc.data() is never undefined for query doc snapshots
  console.log(doc.id, " => ", doc.data());
});

if(docIdsForMintedTrue.length <= quantityForMint){
quantityForMintUpdate = docIdsForMintedTrue.length
console.log(quantityForMintUpdate)
}else{
  quantityForMintUpdate = quantityForMint
  console.log("quantityForMint"+ quantityForMint)
}

for (let ii = 0; ii< quantityForMintUpdate; ii++){

  const nftRef = doc(db, "nfts/collection/"+nftCollection, docIdsForMintedTrue[ii]);
  
  // Set the "capital" field of the city 'DC'
  await updateDoc(nftRef, {
    minted: true,
    updated_at: serverTimestamp()
  });
}
// let idsA = []
// for (let ia= 0; ia<notMinted.length; ia++){
// console.log("not_m: "+ notMinted.id)
// idsA.push(notMinted.id)
// }
        //add to_mint
        const docRef2 = await addDoc(collection(db, "to_mint"), {
          collection: nftCollection,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
          mint_quantity: quantityForMint, 
          mintDocIds: docIdsForMintedTrue,
          minted: false,
          uid: uid,
          publicKey: pk
        });
      


        //reload component 
        window.location.reload();


    }, [publicKey, sendTransaction, connection]);

    
function setTheLamports(e: any)
{
    console.log(Number(e.target.value));
    setLamports(Number(e.target.value));
    lamports = e.target.value;
    thelamports = lamports;
}
function setTheWallet(e: any){
    setWallet(e.target.value)
    theWallet = e.target.value;
}
    return (
        <div className="App">
            
                <div className="navbar">
        <div className="navbar-inner ">
          <a id="title" className="brand brandMenu" href="#">Serpent</a>
          <ul className="nav">


          </ul>
          <ul className="nav pull-right">
                      <li className='whitepaper'><a href="#">White Paper</a></li>
                      <li className="divider-vertical"></li>
                      <li><WalletMultiButton /></li>

                    </ul>
        </div>
      </div>
      <div>
      <h3 className='collection'>Cryptography Punks <span className='sacollection'>a Serpent Academy Official Collection</span> </h3>
      <div className="shardContainer">
      <p className='sol'><strong>Mint Cost:</strong><span className='sol'>◎ .03 Sol</span>
      </p>

  
      </div>
    </div>
    <div className='btnContainer'>
<div className='btnConatiner'>


<p className='sol'><strong>Mint Quantity: (Available: {availableForMint})</strong></p>

<div className="btn-group containerNumberToMint">
                <button onClick={decrement} className="btn">-</button>
                <button onClick={increment} className="btn">+</button>
                <button disabled={true} className='btn' style={{color:"#FFF", background:"black"}}>{quantityForMint}</button>
              </div>
              <div className="progress progressBar">

  <div style={{width:percentageSold}}  className="bar">{percentageSold} sold ({alreadyMinted}/{totalI})</div>
 
</div>
<button className= 'btnMint' onClick={onClickGo}>Mint</button>
<br/>
</div>
</div>
        <br></br>
        <div className='mintContainer '>
        <div className="card">
            <img className='nftImage' src='https://arweave.net/h520OlaRLI8J2sI3gg9BU9V2HNDkudjvYcvEfk3V8jE'></img>
</div>

      </div>
      <div><a className='whiteFooter' href="https://drive.google.com/file/d/1s_GnHASxpvLshirkYgfSZq0SxjRMEU1W/view">
        White Paper | </a>  <a className='whiteFooter' href='https://mint.serpent.academy'>Mint Serpent Token </a><br></br>
        <a className='whiteFooter' href='https://www.udemy.com/course/solana-blockchain-developer/?referralCode=41931F71EDD5CF797CF4'>Solana Developer</a>
        </div>


        
    <h2>Official Serpent Collection</h2>
    <a className='whiteFooter' href="https://solsea.io/collection/6148b2baa71fbdd02113b015">
        Pyramids </a>
<br></br>
<a className='whiteFooter' href="https://solsea.io/collection/61566a4b4fb394586dad311b">
  The solarians
</a>
<br></br>
<a className='whiteFooter' href="https://solsea.io/collection/6157d17497c418b710f7d895">
  Hummingbird Gods
</a>
<br></br>
<a className='whiteFooter' href="https://solsea.io/collection/61aee5cc0f889002a33e0e9e">
  The Dog People
</a>
<br></br>
<a className='whiteFooter' href="https://solsea.io/collection/61b41d383c193b5437a2bfb1">
  Ape Punks Org
</a>

<br></br>
<a className='whiteFooter' href="https://solsea.io/collection/61b95aa9307a702ecc3e9566">
  Lion Punks
</a>

<br></br>
<a className='whiteFooter' href="https://solsea.io/collection/61bac791452c102f0b2d56d2">
  Bad Frogs Gang
</a>
<br></br>
<a className='whiteFooter' href="https://solsea.io/collection/61bec47546cd90d1cdc1d6db">
  Bird People
</a>
<br></br>
<a className='whiteFooter' href="https://solsea.io/collection/61c910391123ec2a3e55fc79">
  Lioness Punks
</a>
<br></br>
<a className='whiteFooter' href="https://solsea.io/collection/61d26c2975b2f67704f1dbe9">
  Heroines of Science
</a>
<br></br>
<a className='whiteFooter' href="https://solsea.io/collection/61c2a8bd2dfc9df883ccdd2e">
  Cryptography Punks
</a>
<br></br>
<a className='whiteFooter' href="https://solsea.io/collection/61c3f94450ff8d36be8b9b9e">
  Panda Hominids
</a>
<br></br>
<a className='whiteFooter' href="https://solsea.io/collection/61c69b8255a4670d01e03be4">
  Purgatorius Project
</a>
<br></br>
<a className='whiteFooter' href="https://solsea.io/collection/61d521b786737384f0f7de0f">
  Heroes of Science
</a>
<br></br>
<a className='whiteFooter' href="https://solsea.io/collection/62087bc858140b5aff35bf21">
  Mermaid Apes
</a>
      <br/><br/><br/>

      
        </div>
    );
};
