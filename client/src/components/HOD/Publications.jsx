// Publications.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './Publications.css';

function properCase(str = '') {
  return str
    .toLowerCase()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function Publications() {
  const navigate = useNavigate();
  const types = ['Journal', 'Conference', 'Book Chapter', 'Book'];
  const emptyPerson = { first: '', middle: '', last: '' };

  // form state
  const [pubType, setPubType] = useState(types[0]);
  const [authors, setAuthors] = useState([{ ...emptyPerson }]);
  const [title, setTitle] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());

  // Journal
  const [journalName, setJournalName] = useState('');
  const [volume, setVolume] = useState('');
  const [issue, setIssue] = useState('');
  const [pagesFrom, setPagesFrom] = useState('');
  const [pagesTo, setPagesTo] = useState('');

  // Conference & Book
  const [confFull, setConfFull] = useState('');
  const [confAbbrev, setConfAbbrev] = useState('');
  const [confDateFrom, setConfDateFrom] = useState('');
  const [confDateTo, setConfDateTo] = useState('');
  const [confType, setConfType] = useState('');
  const [venueCity, setVenueCity] = useState('');
  const [venueState, setVenueState] = useState('');
  const [venueCountry, setVenueCountry] = useState('');
  //pages from and to
  const [pubAgency, setPubAgency] = useState('');

  // Book Chapter
  const [bookTitle, setBookTitle] = useState('');
  const [pagesFromBC, setPagesFromBC] = useState('');
  const [pagesToBC, setPagesToBC] = useState('');
  // pubagency
  const [editors, setEditors] = useState([
    { first: '', middle: '', last: '' }
  ]);

  //book
  // title,year,pages,pubagency,
  // venue(city,state,country)
  const [AgencyCity, setAgencyCity] = useState('');
  const [AgencyState, setAgencyState] = useState('');
  const [AgencyCountry, setAgencyCountry] = useState('');

  const changeEditor = (index, field) => (e) => {
    const updated = [...editors];
    updated[index][field] = e.target.value;
    setEditors(updated);
  };

  const addEditor = () => {
    setEditors([...editors, { first: '', middle: '', last: '' }]);
  };

  // list of saved pubs
  const [pubList, setPubList] = useState([]);
  const [editingIdx, setEditingIdx] = useState(null);

  // FORCE uppercase on every keystroke for these handlers:
  const up = fn => e => fn(e.target.value.toUpperCase());

  // authors handlers
  const addAuthor = () => setAuthors(a => [...a, { ...emptyPerson }]);
  const removeAuthor = i => {
    if (authors.length > 1) {
      setAuthors(a => a.filter((_, idx) => idx !== i));
    }
  };
  const changeAuthor = (i, field) => e => {
    const v = e.target.value.toUpperCase();
    setAuthors(a => {
      const c = [...a];
      c[i][field] = v;
      return c;
    });
  };

  // reset form
  const resetForm = () => {
    setPubType(types[0]);
    setAuthors([{ ...emptyPerson }]);
    setTitle(''); setYear(new Date().getFullYear());
    setJournalName(''); setVolume(''); setIssue('');
    setPagesFrom(''); setPagesTo('');
    setConfType('');
    setConfFull(''); setConfAbbrev('');
    setConfDateFrom(''); setConfDateTo('');
    setVenueCity(''); setVenueState(''); setVenueCountry('');
    setPubAgency('');
    setBookTitle(''); setPagesFromBC(''); setPagesToBC('');
    setEditingIdx(null);
    setEditors([{ first: '', middle: '', last: '' }]);
    setAgencyCity(''); setAgencyState(''); setAgencyCountry('');
  };

  const location = useLocation();
  const editData = location.state ? location.state.data : null;
  const isEditing = !!editData;
  // console.log('Edit Data:', editData);
  useEffect(() => {
    if (editData) {
      // Step 1: Set form data (excluding membership)
      setPubType(editData.type);
      setAuthors(editData.authors.map(a => ({ ...a })));
      setTitle(editData.title);
      // Step 2: Set specific fields based on publication type
      if (editData.type === 'Journal') {
        setYear(editData.year);
        setJournalName(editData.journal_name);
        setVolume(editData.volume);
        setIssue(editData.issue);
        setPagesFrom(editData.pages_from);
        setPagesTo(editData.pages_to);
      } else if (editData.type === 'Conference') {
        setConfFull(editData.conf_name);
        setConfAbbrev(editData.conf_abbrev);
        setConfDateFrom(editData.conf_date_from || '');
        setConfDateTo(editData.conf_date_to || '');
        setConfType(editData.conf_type || '');
        setVenueCity(editData.venue_city);
        setVenueState(editData.venue_state);
        setVenueCountry(editData.venue_country);
        setPubAgency(editData.publication_agency);
        setPagesFrom(editData.conf_pages_from);
        setPagesTo(editData.conf_pages_to);
      } else if (editData.type === 'Book Chapter') {
        setYear(editData.year);
        setBookTitle(editData.book_title);
        setPagesFromBC(editData.book_pages_from);
        setPagesToBC(editData.book_pages_to);
        setPubAgency(editData.book_publication_agency);
        setEditors(editData.editors ? editData.editors.map(a => ({ ...a })) : [{ first: '', middle: '', last: '' }]);
      } else {
        // Book
        setYear(editData.year);
        setPubAgency(editData.book_publication_agency);
        setAgencyCity(editData.agency_city);
        setAgencyState(editData.agency_state);
        setAgencyCountry(editData.agency_country);
      }

    }
  }, [editData]);

  // submit handler

  const handleSubmit = async e => {
    e.preventDefault();
    const baseRecord = {
      type: pubType,
      title,
      year,
      authors: authors.map(a => ({
        first: a.first || "",
        middle: a.middle || "",
        last: a.last || ""
      })),
      editors: []
    };
    let finalRecord = { ...baseRecord };

    if (pubType === 'Journal') {
      finalRecord = {
        ...finalRecord,
        journal_name: journalName,
        volume,
        issue,
        pages_from: pagesFrom,
        pages_to: pagesTo,

        // Set other types' fields to null/empty
        conf_name: "", conf_abbrev: "", conf_type: null,
        conf_date_from: null, conf_date_to: null,
        venue_city: "", venue_state: "", venue_country: "",
        publication_agency: "", conf_pages_from: "", conf_pages_to: "",
        book_title: "", book_publication_agency: "",
        book_pages_from: "", book_pages_to: "",
        agency_city: "", agency_state: "", agency_country: ""
      };
    } else if (pubType === 'Conference') {
      finalRecord = {
        ...finalRecord,
        conf_name: confFull,
        conf_abbrev: confAbbrev,
        conf_type: confType || 'International',
        conf_date_from: confDateFrom || null,
        conf_date_to: confDateTo || null,
        venue_city: venueCity,
        venue_state: venueState,
        venue_country: venueCountry,
        publication_agency: pubAgency,
        conf_pages_from: pagesFrom,
        conf_pages_to: pagesTo,

        journal_name: "", volume: "", issue: "", pages_from: "", pages_to: "",
        book_title: "", book_publication_agency: "",
        book_pages_from: "", book_pages_to: "",
        agency_city: "", agency_state: "", agency_country: ""
      };
    } else if (pubType === 'Book Chapter') {
      finalRecord = {
        ...finalRecord,
        book_title: bookTitle,
        book_publication_agency: pubAgency,
        book_pages_from: pagesFromBC,
        book_pages_to: pagesToBC,
        editors: editors.map(e => ({
          first: e.first || "",
          middle: e.middle || "",
          last: e.last || ""
        })),

        journal_name: "", volume: "", issue: "", pages_from: "", pages_to: "",
        conf_name: "", conf_abbrev: "", conf_type: null,
        conf_date_from: null, conf_date_to: null,
        venue_city: "", venue_state: "", venue_country: "",
        publication_agency: "", conf_pages_from: "", conf_pages_to: "",
        agency_city: "", agency_state: "", agency_country: ""
      };
    }
    else {
      finalRecord = {
        ...finalRecord,
        book_title: bookTitle,
        book_publication_agency: pubAgency,
        book_pages_from: pagesFromBC,
        book_pages_to: pagesToBC,
        agency_city: AgencyCity,
        agency_state: AgencyState,
        agency_country: AgencyCountry,

        journal_name: "", volume: "", issue: "", pages_from: "", pages_to: "",
        conf_name: "", conf_abbrev: "", conf_type: null,
        conf_date_from: null, conf_date_to: null,
        venue_city: "", venue_state: "", venue_country: "",
        publication_agency: "", conf_pages_from: "", conf_pages_to: "",
        editors: []
      };
    }

    const url = isEditing
      ? `http://localhost:5000/api/publications/${editData.id}`
      : `http://localhost:5000/api/publications`;
    const method = isEditing ? 'PUT' : 'POST';

    // 4) Send to backend
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalRecord)
      });
      // if (!res.ok) throw new Error("Failed to save publication");
      if (!res.ok) throw new Error(await res.text());
      const saved = await res.json();

      navigate('/hod/publication');
      alert('Publication submitted sucessfully!');
      resetForm();
    } catch (err) {
      console.error('Error submitting publication:', err);
      alert('Save failed: ' + err.message);
    }
  };

  // render one citation string
  // const formatCitation = r => {
  //   const names = r.authors
  //     .map(a => properCase(`${a.first} ${a.middle} ${a.last}`.trim()))
  //     .join(', ');
  //   const t = properCase(r.title);
  //   const y = r.year;
  //   if (r.pubType === 'Journal') {
  //     const d = r;
  //     return `${names}, “${t}”, ${properCase(d.journalName)}, vol. ${d.volume}, no. ${d.issue}, pp. ${d.pagesFrom}–${d.pagesTo}, ${y}.`;
  //   }
  //   if (r.pubType === 'Conference') {
  //     const d = r;
  //     const confName = properCase(d.confFull);
  //     const abbr = d.confAbbrev;
  //     const ven = d.venue;
  //     return `${names}, “${t}”, Proceedings of the ${confName} (${abbr}), ${properCase(ven.city)}, ${properCase(ven.state)}, ${properCase(ven.country)}: ${properCase(d.pubAgency)}, ${d.confDateFrom} – ${d.confDateTo}, pp. ${d.pagesFrom}–${d.pagesTo}.`;
  //   }
  //   if (r.pubType === 'Book Chapter') {
  //     const d = r;
  //     const enames = editors
  //       .map(a => properCase(`${a.first} ${a.middle} ${a.last}`.trim()))
  //       .join(', ');
  //     // assume editors = authors list for demo
  //     // const editors = names;
  //     return `${names}, “${t}”, In: ${enames} (eds) ${properCase(d.bookTitle)}, ${properCase(d.pubAgency)}, pp. ${d.pagesFromBC}–${d.pagesToBC}, ${y}.`;
  //   }
  //   // Book 
  //   {
  //     const d = r;
  //     const ven = d.venue;
  //     return `${names}, “${t}”, ${properCase(d.pubAgency)}, ${properCase(ven.city)}, ${properCase(ven.state)}, ${properCase(ven.country)}, ${y}.`;
  //   }
  // };
  const years = Array.from(
    { length: new Date().getFullYear() - 1960 + 1 },
    (_, i) => 1960 + i
  ).reverse();


  const removeEditor = (index) => {
    const updated = editors.filter((_, i) => i !== index);
    setEditors(updated);
  };



  return (
    <div className="pub-container">
      <form className="pub-form" onSubmit={handleSubmit}>
        {/* <div className="head" style={{ textAlign: 'center', backgroundColor: 'white', margin: '0', marginBottom: '20px', color: 'black', fontSize: '35px' }}>Add Publications</div> */}
        {/* type */}
        <div className="form-row" >
          <label className='required'>Type</label>
          <select
            value={pubType}
            onChange={e => setPubType(e.target.value)}
          >
            {types.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* authors */}
        <div className="form-row authors-section full">
          <label className='required'>Author's Name</label>
          <div className="authors-list">
            {authors.map((a, i) => (
              <div key={i} className="author-row">
                <input
                  placeholder="First"
                  value={a.first}
                  onChange={changeAuthor(i, 'first')}
                  required
                />
                <input
                  placeholder="Middle"
                  value={a.middle}
                  onChange={changeAuthor(i, 'middle')}
                />
                <input
                  placeholder="Last"
                  value={a.last}
                  onChange={changeAuthor(i, 'last')}
                  required
                />
                {i > 0 && (
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeAuthor(i)}
                  ><img src="/delete.png" alt="" /></button>
                )}
              </div>
            ))}
            <button type="button" className="add-btn" onClick={addAuthor}>
              ＋ Add Author
            </button>
          </div>
        </div>

        {/* title & year */}
        <div className="form-grid">
          <div className="grid-item">
            <label className='required'>Title of {pubType === 'Book' ? 'Book' : 'Paper'}</label>
            <input
              value={title}
              onChange={up(setTitle)}
              required
            />
          </div>
          {pubType !== 'Conference' && <>
            <div className="grid-item">
              <label className='required' htmlFor="year">Year of Publication</label>
              <select style={{ padding: '6px', fontSize: '15px', borderRadius: '5px' }} value={year} onChange={e => setYear(e.target.value)}>
                {years.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
          </>}

          {/* Journal */}
          {pubType === 'Journal' && <>
            <div className="grid-item">
              <label className='required'>Name of Journal</label>
              <input value={journalName} onChange={up(setJournalName)} />
            </div>
            <div className="grid-item">
              <label className='required'>Volume</label>
              <input value={volume} onChange={up(setVolume)} />
            </div>
            <div className="grid-item">
              <label className='required'>Number</label>
              <input value={issue} onChange={up(setIssue)} />
            </div>
            <div className="grid-item">
              <label className='required'>Pages</label>
              <div className="pages-row">
                <input placeholder="From" value={pagesFrom} onChange={up(setPagesFrom)} />
                <input placeholder="To" value={pagesTo} onChange={up(setPagesTo)} />
              </div>
            </div>
          </>}

          {/* Conference */}
          {pubType === 'Conference' && <>
            <div className="grid-item">
              <label className='required'>Full Name of Conference</label>
              <input value={confFull} onChange={up(setConfFull)} />
            </div>
            <div className="grid-item">
              <label>Abbreviation of Conference</label>
              <input value={confAbbrev} onChange={up(setConfAbbrev)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '20px' }} className="grid-item date">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label className='required'>Date From</label>
                <input type="date" value={confDateFrom} onChange={e => setConfDateFrom(e.target.value)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label className='required'>Date To</label>
                <input type="date" value={confDateTo} onChange={e => setConfDateTo(e.target.value)} />
              </div>
            </div>
            <div className="grid-item">
              <label className='required'>Type of Conference</label>
              <select style={{ padding: '6px', fontSize: '15px', borderRadius: '5px' }} value={confType} onChange={e => setConfType(e.target.value)}>
                <option>International</option><option>National</option>
              </select>
            </div>
            <div className="grid-item">
              <label className='required'>Pages</label>
              <div className="pages-row">
                <input placeholder="From" value={pagesFrom} onChange={up(setPagesFrom)} />
                <input placeholder="To" value={pagesTo} onChange={up(setPagesTo)} />
              </div>
            </div>
            <fieldset className="grid-item full venue-group">
              <legend>Venue</legend>
              <div className="sub-grid">
                <div>
                  <label className='required' style={{ marginRight: '10px' }}>City</label>
                  <input style={{ height: '10px' }} value={venueCity} onChange={up(setVenueCity)} />
                </div>
                <div>
                  <label className='required' style={{ marginRight: '10px' }}>State</label>
                  <input style={{ height: '10px' }} value={venueState} onChange={up(setVenueState)} />
                </div>
                <div>
                  <label className='required' style={{ marginRight: '10px' }}>Country</label>
                  <input style={{ height: '10px' }} value={venueCountry} onChange={up(setVenueCountry)} />
                </div>
              </div>
            </fieldset>
            <div className="grid-item">
              <label className='required'>Publication Agency</label>
              <input value={pubAgency} onChange={up(setPubAgency)} />
            </div>
          </>}

          {(pubType === 'Book Chapter') && <>
            <div className="grid-item">
              <label className='required'>Title of Book</label>
              <input value={bookTitle} onChange={up(setBookTitle)} />
            </div>
            <div className="grid-item">
              <label className='required'>Pages</label>
              <div className="pages-row">
                <input placeholder="From" value={pagesFromBC} onChange={up(setPagesFromBC)} />
                <input placeholder="To" value={pagesToBC} onChange={up(setPagesToBC)} />
              </div>
            </div>
            <div className="grid-item full">
              <label className='required'>Publication Agency</label>
              <input value={pubAgency} onChange={up(setPubAgency)} />
            </div>
          </>}

          {(pubType === 'Book') && <>
            {/* <div className="grid-item">
              <label>Pages</label>
              <div className="pages-row">
                <input placeholder="From" value={pagesFromBC} onChange={up(setPagesFromBC)} />
                <input placeholder="To" value={pagesToBC} onChange={up(setPagesToBC)} />
              </div>
            </div> */}
            <div className="grid-item full">
              <label className='required'>Publication Agency</label>
              <input value={pubAgency} onChange={up(setPubAgency)} />
            </div>
            <fieldset className="grid-item full venue-group">
              <legend className='required'>Address of Agency</legend>
              <div className="sub-grid">
                <div>
                  <label className='required' style={{ marginRight: '10px' }}>City</label>
                  <input style={{ height: '10px' }} value={AgencyCity} onChange={up(setAgencyCity)} />
                </div>
                <div>
                  <label className='required' style={{ marginRight: '10px' }}>State</label>
                  <input style={{ height: '10px' }} value={AgencyState} onChange={up(setAgencyState)} />
                </div>
                <div>
                  <label className='required' style={{ marginRight: '10px' }}>Country</label>
                  <input style={{ height: '10px' }} value={AgencyCountry} onChange={up(setAgencyCountry)} />
                </div>
              </div>
            </fieldset>
          </>}
        </div>
        {(pubType === 'Book Chapter') && <>
          {/* Editors Section */}
          <div style={{ marginTop: '20px' }} className=" form-row editors-section">
            <label className='required'>Editor's Name</label>
            <div className="editors-list">
              {editors.map((e, i) => (
                <div key={i} className="editor-row">
                  <input
                    placeholder="First"
                    value={e.first}
                    onChange={changeEditor(i, 'first')}
                    required
                  />
                  <input
                    placeholder="Middle"
                    value={e.middle}
                    onChange={changeEditor(i, 'middle')}
                  />
                  <input
                    placeholder="Last"
                    value={e.last}
                    onChange={changeEditor(i, 'last')}
                    required
                  />
                  {i > 0 && (
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeEditor(i)}
                    >
                      <img src="/delete.png" alt="Remove Editor" />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="add-btn" onClick={addEditor}>
                ＋ Add Editor
              </button>
            </div>
          </div>

        </>}
        <div className="button-row">
          <button type="submit">
            {editingIdx !== null ? 'Update Publication' : 'Save Publication'}
          </button>
        </div>
      </form>

      {/* Cards Preview */}
      {/* <div className="cards-container">
        {pubList.map((r, idx) => (
          <div key={idx} className="pub-card">
            <div className="card-header">
              <span>{r.pubType}</span>
              <div style={{ display: 'flex' }} className="card-actions">
                <button onClick={() => onEdit(idx)}>Edit</button>
                <button onClick={() => onDelete(idx)}>Delete</button>
              </div>
            </div>
            <div className="card-body">
               {formatCitation(r)}
            </div>
          </div>
        ))}
      </div> */}

    </div>
  );
}
