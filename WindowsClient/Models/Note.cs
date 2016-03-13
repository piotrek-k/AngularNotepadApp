using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WindowsClient.Models
{
    class Note
    {
        public int NoteId { get; set; }
        public DateTime? CreationDate { get; set; }
        public string AuthorId { get; set; }
    }
}
