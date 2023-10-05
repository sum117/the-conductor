import {Character} from "@prisma/client";
import React from "react";
import {AuthContext} from "./context/Auth";
import useAuth from "./hooks/useAuth";
import "./index.css";

const DISCORD_OAUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${Bun.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
  Bun.env.WEBSITE_BASE_URL,
)}&response_type=code&scope=identify`;

export default function App() {
  const {user, logout, setUser} = useAuth();
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>Bun, Elysia & React</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css" />
        <meta name="description" content="Bun, Elysia & React" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <AuthContext.Provider value={{user, setUser}}>
          <main className="container">
            <section>{user?.characters?.map((character) => <Character {...character} key={character.id} />)}</section>
            {!user ? (
              <a role="button" href={DISCORD_OAUTH_URL} className="outline">
                Login with Discord
              </a>
            ) : (
              <button onClick={logout} className="outline">
                Logout
              </button>
            )}
          </main>
        </AuthContext.Provider>
      </body>
    </html>
  );
}

const Character = (character: Character) => {
  if (!character.id) return null;
  if (!character.imageUrl) return null;
  if (!character.personality) return null;
  if (!character.name) return null;

  return (
    <article>
      <h2>{character.name}</h2>
      <img src={character.imageUrl} alt={character.name} />
      <p>{character.personality}</p>
    </article>
  );
};
