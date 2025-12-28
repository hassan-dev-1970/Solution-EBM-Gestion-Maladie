function calcul_dec_optique(){

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++  
//============ Calcul TOTAL PRIX DES VERRES =======================================
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++  

  let tarif_tot_verre, prix_OD, prix_OG, prix_AR, Prix_TVA, taux_contrat, base_remb_verres, TTV

  prix_OD = document.getElementById('MT_OD').value;
  prix_OG = document.getElementById('MT_OG').value;
  prix_AR = document.getElementById('MT_AR').value;

  tarif_tot_verre = Number(prix_OD) + Number(prix_OG) + Number(prix_AR);
  tarif_tot_verre = tarif_tot_verre.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
document.getElementById('MT_tot_verre').value = tarif_tot_verre;

//============ Calcul TVA =======================================

Prix_TVA = (Number(prix_OD) + Number(prix_OG) + Number(prix_AR)) - ((Number(prix_OD) + Number(prix_OG) + Number(prix_AR)) / 1.20);
Prix_TVA = Prix_TVA.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
document.getElementById('MT_TVA').value = Prix_TVA;

//============ Calcul PRIX NETTE VERRES =======================================

prix_nette_verre = (Number(prix_OD) + Number(prix_OG) + Number(prix_AR)) - ((Number(prix_OD) + Number(prix_OG) + Number(prix_AR)) - ((Number(prix_OD) + Number(prix_OG) + Number(prix_AR)) / 1.20));
prix_nette_verre = prix_nette_verre.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
document.getElementById('MT_nette_verre').value = prix_nette_verre;

//============ Calcul BASE REMBOURSEMENT VERRES =======================================

taux_contrat = document.getElementById('TauxRembs').value;
base_remb_verres = (((Number(prix_OD) + Number(prix_OG) + Number(prix_AR)) / 1.20) * Number(taux_contrat))
base_remb_verres = base_remb_verres.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
document.getElementById('MT_base_verre').value = base_remb_verres;



//============ Calcul REMBOURSEMENT DEFINITIF VERRES =======================================

let PLF_verre, FE_verre, prix_definitif_verre

PLF_verre = document.getElementById('plaf_verre').value;
FE_verre = document.getElementById('FE_verre').value;


if (PLF_verre == 0 && (((Number(prix_OD) + Number(prix_OG) + Number(prix_AR)) / 1.20) * Number(taux_contrat)) > FE_verre){
prix_definitif_verre = FE_verre;

}else{
  prix_definitif_verre = (((Number(prix_OD) + Number(prix_OG) + Number(prix_AR)) / 1.20) * Number(taux_contrat));
}
prix_definitif_verre = prix_definitif_verre.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
document.getElementById('MT_definitif_verre').value = prix_definitif_verre;

//----------------------------------------------------------------------------------------------------------------------------------
if(PLF_verre !=0)
{
if((((Number(prix_OD) + Number(prix_OG) + Number(prix_AR)) / 1.20) * Number(taux_contrat)) > PLF_verre && FE_verre > PLF_verre){
prix_definitif_verre = PLF_verre;

}else if((((Number(prix_OD) + Number(prix_OG) + Number(prix_AR)) / 1.20) * Number(taux_contrat)) > FE_verre && PLF_verre > FE_verre){
prix_definitif_verre = FE_verre;

}else if((((Number(prix_OD) + Number(prix_OG) + Number(prix_AR)) / 1.20) * Number(taux_contrat)) < PLF_verre && (((Number(prix_OD) + Number(prix_OG) + Number(prix_AR)) / 1.20) * Number(taux_contrat)) < FE_verre){
prix_definitif_verre = (((Number(prix_OD) + Number(prix_OG) + Number(prix_AR)) / 1.20) * Number(taux_contrat));
}

prix_definitif_verre = prix_definitif_verre.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
document.getElementById('MT_definitif_verre').value = prix_definitif_verre;

}


//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++  
//============ Calcul TOTAL PRIX DE LA MONTURE =======================================
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++  


let xFE_monture, xPLF_monture,TVA_monture, prix_nette_monture, base_remb_monture, remb_definitif_monture

xFE_monture = document.getElementById('FE_monture').value;
xPLF_monture = document.getElementById('plaf_monture').value;


//============ Calcul TVA Monture =======================================

TVA_monture = xFE_monture - (Number(xFE_monture) / 1.20);
TVA_monture = TVA_monture.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
document.getElementById('TVA_monture').value = TVA_monture;


//============ Prix nette Monture =======================================

prix_nette_monture = xFE_monture - (xFE_monture - (Number(xFE_monture) / 1.20));
prix_nette_monture = prix_nette_monture.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
document.getElementById('nette_monture').value = prix_nette_monture;


//============ Base de remboursement Monture =======================================

base_remb_monture = (Number(xFE_monture) / 1.20) * Number(taux_contrat);
base_remb_monture = base_remb_monture.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
document.getElementById('base_remb_monture').value = base_remb_monture;


//============ Calcul REMBOURSEMENT DEFINITIF MONTURE =======================================


if (xPLF_monture == 0){
  remb_definitif_monture = ((Number(xFE_monture) / 1.20) * Number(taux_contrat));

  remb_definitif_monture = remb_definitif_monture.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
  document.getElementById('remb_defint_monture').value = remb_definitif_monture;
}

  //----------------------------------------------------------------------------------------------------------------------------------
  if(xPLF_monture !=0)
  {
  if((((Number(xFE_monture) / 1.20) * Number(taux_contrat))) > xPLF_monture){
    remb_definitif_monture  = xPLF_monture;
 
  }else{
    remb_definitif_monture = ((Number(xFE_monture) / 1.20) * Number(taux_contrat));
  }
  
  remb_definitif_monture  = remb_definitif_monture .toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
  document.getElementById('remb_defint_monture').value = remb_definitif_monture ;
  
  }

}