import { getAuth, signInWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { afficherMessageIndex } from "../barreTools"; 

const auth = getAuth();

document.getElementById("loginBtn").addEventListener("click", async () => {

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    //console.log("Connecté :", userCredential.user);
  } catch (error) {
      if (error.code === "auth/invalid-credential") {
          afficherMessageIndex("Email ou mot de passe incorrect !", "error");
          return;
      }
    //console.error("Erreur login :", error.code, error.message);
    afficherMessageIndex("Une erreur est survenue !", "error");
  }

});