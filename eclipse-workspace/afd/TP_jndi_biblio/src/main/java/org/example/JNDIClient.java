package org.example;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import java.util.Hashtable;
import java.util.Scanner;

public class JNDIClient {
    public static void main(String[] args) {
        Hashtable<String, String> env = new Hashtable<>();
        env.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.fscontext.RefFSContextFactory");
        env.put(Context.PROVIDER_URL, "file:///tmp/bibliotheque_jndi");

        try {
            Context ctx = new InitialContext(env);
            Bibliotheque bibliotheque = (Bibliotheque) ctx.lookup("bibliotheque");

            Scanner scanner = new Scanner(System.in);
            while (true) {
                System.out.println("Menu:");
                System.out.println("1. Ajouter un livre");
                System.out.println("2. Rechercher un livre");
                System.out.println("3. Lister tous les livres");
                System.out.println("4. Quitter");
                System.out.print("Choisissez une option: ");
                int choix = scanner.nextInt();
                scanner.nextLine();  // consomme le saut de ligne

                switch (choix) {
                    case 1:
                        System.out.print("Titre du livre: ");
                        String titre = scanner.nextLine();
                        System.out.print("Auteur du livre: ");
                        String auteur = scanner.nextLine();
                        Livre livre = new Livre(titre, auteur);
                        bibliotheque.ajouterLivre(livre);
                        System.out.println("Livre ajouté.");
                        break;

                    case 2:
                        System.out.print("Titre du livre à rechercher: ");
                        titre = scanner.nextLine();
                        Livre recherche = bibliotheque.rechercherLivre(titre);
                        if (recherche != null) {
                            System.out.println("Livre trouvé : " + recherche);
                        } else {
                            System.out.println("Livre non trouvé.");
                        }
                        break;

                    case 3:
                        System.out.println("Liste des livres:");
                        for (Livre l : bibliotheque.listerTousLesLivres()) {
                            System.out.println(l);
                        }
                        break;

                    case 4:
                        System.out.println("Au revoir!");
                        return;

                    default:
                        System.out.println("Choix invalide.");
                        break;
                }
            }
        } catch (NamingException e) {
            e.printStackTrace();
        }
    }
}

