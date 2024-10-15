package org.example;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import java.util.Hashtable;

public class JNDIServer {
    public static void main(String[] args) {
        Hashtable<String, String> env = new Hashtable<>();
        env.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.fscontext.RefFSContextFactory");
        env.put(Context.PROVIDER_URL, "file:///C:/tmp/bibliotheque_jndi");

        try {
            Context ctx = new InitialContext(env);
            Bibliotheque bibliotheque = new Bibliotheque();
            ctx.bind("bibliotheque", bibliotheque);  // Lier l'objet "référençable"
            System.out.println("Serveur JNDI prêt. Bibliothèque liée.");
        } catch (NamingException e) {
            e.printStackTrace();
        }
    }
}


