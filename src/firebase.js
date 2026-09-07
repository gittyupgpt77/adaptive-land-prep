import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
 sendEmailVerification, sendPasswordResetEmail, signOut, updatePassword } from 'firebase/auth';
import { getFirestore, doc, runTransaction, serverTimestamp } from 'firebase/firestore';

// Public application configuration. Authorization is enforced by firestore.rules.
export function createClient(){
 const app=initializeApp({
  apiKey:'AIzaSyBeqIzy3i6untwYK6vU70A_pNdxNo5lPII',
  authDomain:'adaptive-land-prep.firebaseapp.com',
  projectId:'adaptive-land-prep',
  appId:'1:539189149308:web:70507402664459b08293f9'
 });
 const auth=getAuth(app),db=getFirestore(app);
 const user=()=>auth.currentUser?.emailVerified&&!auth.currentUser.isAnonymous?{id:auth.currentUser.uid,email:auth.currentUser.email}:null;
 const wrap=fn=>async args=>{try{return {data:await fn(args)}}catch(error){return {error:readable(error)}}};
 const readable=error=>{
  const messages={
   'auth/operation-not-allowed':'Account setup is not available yet. Your device data is unchanged.',
   'auth/configuration-not-found':'Account setup is not available yet. Your device data is unchanged.',
   'auth/invalid-credential':'Check your email and password and try again.',
   'auth/email-already-in-use':'An account already exists for this email. Sign in or reset your password.',
   'auth/too-many-requests':'Too many attempts. Wait a little before trying again.',
   'auth/network-request-failed':'Unable to connect. Your entries remain on this device.'
  };
  if(messages[error.code])return Object.assign(Error(messages[error.code]),{code:error.code});return error;
 };
 return {
  auth:{
   onAuthStateChange(fn){return onAuthStateChanged(auth,()=>fn(user()?'SIGNED_IN':'SIGNED_OUT',{user:user()}))},
   getUser:wrap(async()=>({user:user()})),
   signInWithPassword:wrap(async({email,password})=>{
    const credential=await signInWithEmailAndPassword(auth,email,password);
    if(!credential.user.emailVerified){
     try{await sendEmailVerification(credential.user)}finally{await signOut(auth)}
     throw Error('Confirm your email first. A new confirmation link has been sent; then return and sign in.');
    }
    return {user:user()};
   }),
   signUp:wrap(async({email,password})=>{
    const credential=await createUserWithEmailAndPassword(auth,email,password);
    try{await sendEmailVerification(credential.user)}finally{await signOut(auth)}
    return {};
   }),
   // Firebase's hosted action page handles resets and confirmations. No app password token parsing.
   resetPasswordForEmail:wrap(async email=>sendPasswordResetEmail(auth,email)),
   updateUser:wrap(async({password})=>updatePassword(auth.currentUser,password)),
   signOut:wrap(async()=>signOut(auth))
  },
  makeStore(assertCurrent){return window.FirestoreBackup.createFirestoreStore({
   sdk:{doc,runTransaction,serverTimestamp},db,storage:localStorage,
   assertOwner:id=>{if(user()?.id!==id)throw Error('Your account changed. Please sign in again.');assertCurrent(id)}
  })}
 };
}
