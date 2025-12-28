
//===================== TRI LISTE DEROULANTE ===========================
function trilist(){
}  


function sortList() {
  let list, i, switching, b, shouldSwitch;
  list = document.getElementsByClassName("Liste");
  
  Array.prototype.filter.call(list, function(list) {
  switching = true;
  // Faites une boucle qui continuera jusqu'à ce qu'aucune commutation n'ait été effectuée: 
  while (switching) {
    // commencez par dire : aucune commutation n’est effectuée:
    switching = false;
    b = list.getElementsByTagName("option");

    // Parcourez tous les éléments de la liste:
    for (i = 0; i < (b.length - 1); i++) {
      // commencez par dire qu'il ne devrait pas y avoir de changement:
      shouldSwitch = false;
      // vérifiez si l'élément suivant devrait changer de place avec l'élément actuel: 
      if (b[i].innerHTML.toLowerCase() > b[i + 1].innerHTML.toLowerCase()) {
        /* si l'élément suivant est par ordre alphabétique inférieur à l'élément actuel, marquer comme commutateur
        et brise la boucle: */
        shouldSwitch = true;
        break;
      }
    }
    if (shouldSwitch) {
      // Si un interrupteur a été marqué, faites-le et marquez le commutateur comme terminé: 
      b[i].parentNode.insertBefore(b[i + 1], b[i]);
      switching = true;

    }
  }
    
});

}

//===================== RADIO BOUTTON TARIF OPTIQUE ===========================

  document.querySelectorAll('input[name="TO_Y"]').forEach(function(radio) {
  radio.addEventListener('change', function() {
  document.getElementById('tarif_opticien').value = this.value;
    });
});

//===================== RADIO Majoration TO ===========================

document.querySelectorAll('input[name="TMO_Y"]').forEach(function(radio) {
radio.addEventListener('change', function() {
document.getElementById('tarif_majoration').value = this.value;
  });
});

//===================== RADIO AR ===========================

document.querySelectorAll('input[name="AR_Y"]').forEach(function(radio) {
radio.addEventListener('change', function() {
document.getElementById('tarif_AR').value = this.value;
  });
});

//===================== RADIO AR CLIENT ===========================

document.querySelectorAll('input[name="AR_client"]').forEach(function(radio) {
radio.addEventListener('change', function() {
document.getElementById('tarif_AR_client').value = this.value;
  });
});

//===================== RADIO Majoration TO ===========================

document.querySelectorAll('input[name="TVA_Y"]').forEach(function(radio) {
radio.addEventListener('change', function() {
document.getElementById('tarif_TVA').value = this.value;
  });
});


//===================== CONTROL PHARMACIE NR + OBSERVATIONS =============
function control_pharma(){
let FraisPhrma = document.getElementById('frais_pharma').value;
let NRPhrma = document.getElementById('pharma_NR').value;
let Observat = document.getElementById('observat').value;

if(FraisPhrma == 0 || FraisPhrma == ""){
document.getElementById('pharma_NR').disabled=true;
document.getElementById('observat').disabled=true;
document.getElementById('pharma_NR').value = '';
document.getElementById('observat').value = '';

}else{
  document.getElementById('pharma_NR').disabled=false;
  document.getElementById('observat').disabled=false;
}
if(NRPhrma == 0){
document.getElementById('observat').disabled=true;
document.getElementById('observat').value = '';
}else{
  document.getElementById('observat').disabled=false;
}
}


//===================== TAUX DE REMBOURSEMENT ===========================

function Taux_Remb(){

  let TauxRemb = document.getElementById('Taux_Rembs').value; // Combo taux remboursement
  let Conv_T_Remb

 Conv_T_Remb = ""

   switch(TauxRemb){
      case'70%':
        Conv_T_Remb = "0.7";
       break;  
       case'75%':
        Conv_T_Remb = "0.75";
       break;        
       case '80%':
        Conv_T_Remb = "0.8";
        break; 
      case '85%':
        Conv_T_Remb = "0.85";
        break; 
      case '90%':
        Conv_T_Remb = "0.9";
        break; 
      case '95%':
        Conv_T_Remb = "0.95";
          break;
      case '100%':
        Conv_T_Remb = "10";
          break;
  }

  document.getElementById('Conv_Taux_Remb').value = Conv_T_Remb;
  document.getElementById('Conv_Taux_Remb').sort(function(a, b){return a-b});

}


//=====================TYPE DES VERRES===========================

function verre_nature(){
  let TPV = document.getElementById('TPV_liste').value;
  document.getElementById('CTRL_TYPV').value = TPV; // input de calcul
}

//=====================TOTAL DEGRE===========================
function total_degre(){

  // ======= OD ================

let D_OD = document.getElementById('degre_OD').value;
let ASTG_OD = document.getElementById('astigm_OD').value;

let TD_OD = Number(D_OD) + Number(ASTG_OD) ;
TD_OD = TD_OD.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });

TD_OD = TD_OD.replace(/-/g, "");

// supprimer les 2 zéros après la virgule
let Number_OD = TD_OD.toString().replace(/\,?0+$/, '');
document.getElementById("degre_T_OD").value = Number_OD;

ASTG_OD = ASTG_OD.replace(/-/g, "");
document.getElementById("Conv-AS-OD").value = ASTG_OD;

// ========= Definition de la DIOPTRIE --> OD ==================
if(ASTG_OD == "0"){
document.getElementById('dioptrie_OD').value = 'Spherique';

}else if(ASTG_OD == "0.25" || ASTG_OD == "0.5" || ASTG_OD == "0.50" || ASTG_OD == "0.75" || ASTG_OD == "1" || ASTG_OD == "1.25" || ASTG_OD == "1.5" || ASTG_OD == "1.50" || ASTG_OD == "1.75" || ASTG_OD == "2"){
document.getElementById('dioptrie_OD').value = 'Torique_1';

}else{
  document.getElementById('dioptrie_OD').value = 'Torique_2';

}

  // ======= OG ================

let D_OG = document.getElementById('degre_OG').value;
let ASTG_OG = document.getElementById('astigm_OG').value;

let TD_OG = Number(D_OG) + Number(ASTG_OG) ;
TD_OG = TD_OG.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });

TD_OG = TD_OG.replace(/-/g, "");
// supprimer les 2 zéros après la virgule
let Number_OG = TD_OG.toString().replace(/\,?0+$/, '');
document.getElementById("degre_T_OG").value = Number_OG;


ASTG_OG = ASTG_OG.replace(/-/g, "");
document.getElementById("Conv-AS-OG").value = ASTG_OG;

// ========= Definition de la DIOPTRIE --> OG ==================
if(ASTG_OG == "0"){
  document.getElementById('dioptrie_OG').value = 'Spherique';
  //document.getElementById("CTRL_DPT_OG").value = 'Spherique'; // input de calcul

  }else if(ASTG_OG == "0.25" || ASTG_OG == "0.5" || ASTG_OG == "0.50" || ASTG_OG == "0.75" || ASTG_OG == "1" || ASTG_OG == "1.25" || ASTG_OG == "1.5" || ASTG_OG == "1.50" || ASTG_OG == "1.75" || ASTG_OG == "2")
    {document.getElementById('dioptrie_OG').value = 'Torique_1';
      //document.getElementById("CTRL_DPT_OG").value = 'Torique_1'; // input de calcul

  }else{
    document.getElementById('dioptrie_OG').value = 'Torique_2';
   // document.getElementById("CTRL_DPT_OG").value = 'Torique_2'; // input de calcul

  }
}

//=====================TAUX DE MAJORATION TARIF DES VERRES===========================
//=============== VIDER LES CHAMPS SI MAJORATION_TO EST NON ================
function Vider_Majorat_TO(){ 
  document.getElementById('Type_Majorat').value ="";
  document.getElementById('majorat_TO').value = "";
  document.getElementById('Conv-T-Major').value = "0.00";
}  

function Liber_AR(){ 
  document.getElementById('AR_client_Y').disabled = false;
  document.getElementById('AR_client_N').disabled = false;
}  

function Verou_AR(){ 
  document.getElementById('AR_client_Y').disabled = true;
  document.getElementById('AR_client_N').disabled = true;
  document.getElementById('AR_client_Y').checked = false;
  document.getElementById('AR_client_N').checked = false;

}  


function majoration_Tarif(){
  let Type_majorat = document.getElementById('Type_Majorat').value;
  let majorat = document.getElementById('majorat_TO').value;
  let Conv_T_Major
  //=============================================================

  //=============================================================

if (Type_majorat == "Tarif"){
  Conv_T_Major = ""

  switch(majorat){
      case '100%':
        Conv_T_Major = "0";
        break;  
      case '150%':
        Conv_T_Major = "0.5";
        break; 
      case '200%':
        Conv_T_Major = "1";
        break; 
      case '250%':
        Conv_T_Major = "1.5";
        break; 
      case '300%':
          Conv_T_Major = "2";
          break;
    }
    document.getElementById('Conv-T-Major').value = Conv_T_Major;

  }
//---------------------------------------------------
if (Type_majorat == "Majoration"){
 Conv_T_Major =""

  switch(majorat){
      case "100%":
        Conv_T_Major = "1";
        break;
      case '150%':
        Conv_T_Major = "1.5";
        break;
      case '200%':
        Conv_T_Major = "2";
        break;
      case '250%':
        Conv_T_Major = "2.5";
        break;
      case '300%':
          Conv_T_Major = "3";
          break;
    }
    document.getElementById('Conv-T-Major').value = Conv_T_Major;

  }

}