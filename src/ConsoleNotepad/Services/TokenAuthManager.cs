using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Principal;
using System.Threading.Tasks;

namespace ConsoleNotepad.OtherClasses
{
    /*
    * Źródło: https://github.com/mrsheepuk/ASPNETSelfCreatedTokenAuthExample
    */

    public class TokenAuthManager
    {
        public string Audience { get; set; }
        public string Issuer { get; set; }
        public SigningCredentials SigningCredentials { get; set; }


        /// <summary>
        /// Konstruuje token do autentykacji
        /// </summary>
        /// <param name="user">Nazwa użytkownika</param>
        /// <param name="expires"></param>
        /// <returns>Zwraca token</returns>
        public string TokenGenerator(string userId, string user, DateTime? expires)
        {
            var handler = new JwtSecurityTokenHandler();

            // Here, you should create or look up an identity for the user which is being authenticated.
            // For now, just creating a simple generic identity.
            ClaimsIdentity identity = new ClaimsIdentity(
                new GenericIdentity(user), //, "TokenAuth"
                new[] {
                    //new Claim("EntityID", "1", ClaimValueTypes.Integer),
                    new Claim(ClaimTypes.NameIdentifier, userId),
                    new Claim(ClaimTypes.Name, user)
                });
            //identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, userId));

            var securityToken = handler.CreateToken(
                issuer: Issuer,
                audience: Audience,
                signingCredentials: SigningCredentials,
                subject: identity,
                expires: expires
                );
            return handler.WriteToken(securityToken);
        }
    }
}
