using ConsoleNotepad.Models;
using Microsoft.AspNet.Http;
using Microsoft.AspNet.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.OptionsModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ConsoleNotepad.Services
{
    /// <summary>
    /// Zmodyfikowana klasa SignInManager
    /// </summary>
    /// <typeparam name="T">ApplicationUser</typeparam>
    public class MySignInManager<T> : SignInManager<ApplicationUser>
    {
        public MySignInManager(UserManager<ApplicationUser> userManager, IHttpContextAccessor contextAccessor, IUserClaimsPrincipalFactory<ApplicationUser> claimsFactory, IOptions<IdentityOptions> optionsAccessor, ILogger<SignInManager<ApplicationUser>> logger) : base(userManager, contextAccessor, claimsFactory, optionsAccessor, logger)
        {
        }

        public override async Task<bool> CanSignInAsync(ApplicationUser user)
        {
            if (!user.AdminConfirmed)
                return false;

            return await base.CanSignInAsync(user);
        }
    }
}
