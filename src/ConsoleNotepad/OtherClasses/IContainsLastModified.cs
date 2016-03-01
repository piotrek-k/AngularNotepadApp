using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ConsoleNotepad.OtherClasses
{
    public interface IContainsLastModified
    {
        DateTime? LastTimeModified { get; set; }
    }
}
