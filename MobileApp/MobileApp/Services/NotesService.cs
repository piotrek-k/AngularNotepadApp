using MobileApp.Pages;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Net;
using System.Net.Http.Headers;
using Xamarin.Forms;

namespace MobileApp.Services
{
    public class NotesService
    {
        public const string siteAdress = "https://jsnotepad.azurewebsites.net/";
        public string Token { get; set; }
        HttpClient client;
        INavigation NavPage;

        public NotesService(string token, INavigation navigationpage)
        {
            Token = token;
            NavPage = navigationpage;
            client = new HttpClient();
            client.BaseAddress = new Uri(siteAdress);
            client.DefaultRequestHeaders.Add("Authorization", token);
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        private async Task<object> getData(string url, Type t)
        {
            var response = await client.GetAsync(url);
            if (response.StatusCode == HttpStatusCode.Unauthorized)
            {
                await NavPage.PushAsync(new LoginPage(), true);
                return null;
            }
            else
            {
                response.EnsureSuccessStatusCode();
                var JsonResult = response.Content.ReadAsStringAsync().Result;
                var data = JsonConvert.DeserializeObject<object>(JsonResult);
                return data;
            }
        }

        public async Task<Note> GetByTags(string searchText)
        {
            string adress = "/api/notes/bytags?searchText=" + searchText;
            return (await getData(adress, typeof(Note))) as Note;
        }

        public async Task<List<Note>> GetSuggested(string searchText)
        {
            string adress = "/api/notes/suggested?searchText=" + searchText;
            return (await getData(adress, typeof(List<Note>))) as List<Note>;
        }

        public async Task<Note> GetOne(int id)
        {
            string adress = "/api/notes/" + id;
            return (await getData(adress, typeof(Note))) as Note;
        }
    }
}
