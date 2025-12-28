
/*Vérification si les champs USER et PASSWORD ne sont pas vides -->*/

    function validation()
    {
        var name=document.f1.Login.value;
        var pass=document.f1.pass.value;
        if(name.length=="" && pass.length=="") {
            Swal.fire({
                title: "Attention message d'erreur !!!",
                text: "Les champs Login et Mot de passe sont vides.",
                icon: "error"
            });
            return false;
        }
        else
        {
            if(name.length=="") {
                Swal.fire({
                    title: "Attention message d'erreur !!!",
                    text: "Le champ Login est vide.",
                    icon: "error"
                });
                return false;
            }
            if (pass.length=="") {
                Swal.fire({
                    title: "Attention message d'erreur !!!",
                    text: "Le champ Mot de passe est vide.",
                    icon: "error"
                });
                return false;
            }
        }
    }
