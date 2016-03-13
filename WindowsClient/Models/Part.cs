using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WindowsClient.Models
{
    public class Part
    {
        public int ID { get; set; }
        public int Type { get; set; }
        public string Data { get; set; } /*Dane części notatki, zawartość wprowadzona przez użytkownika*/
        public string SettingsAsJSON { get; set; } /*Ustawienia wyświetlania*/
        public DateTime? CreationDate { get; set; }

        public int OrderPosition { get; set; }

        public DateTime? LastTimeModified { get; set; }

        public int NoteID { get; set; }
    }
}
