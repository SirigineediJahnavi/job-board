import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [skillFilter, setSkillFilter] = useState('');
  const [yoeFilter, setYoeFilter] = useState('');

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from('Jobs')
      .select('*')
      .order('id', { ascending: false });

    if (!error && data) {
      setJobs(data);
    }
  };

  useEffect(() => {
    fetchJobs();

    const channel = supabase
      .channel('realtime-jobs')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'Jobs' },
        (payload) => {
          setJobs((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchesSkill = job.skills?.toLowerCase().includes(skillFilter.toLowerCase()) || false;
    const matchesYoe = job.yoe?.toLowerCase().includes(yoeFilter.toLowerCase()) || false;
    return matchesSkill && matchesYoe;
  });

  return (
    <div style={{ padding: '24px', fontFamily: 'system-ui, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0' }}>Automated Job Board</h1>
          <p style={{ color: '#666', margin: 0 }}>Filter jobs live by your skills or experience level.</p>
        </div>
        {/* Job Count Badge */}
        <div style={{ background: '#e0e7ff', color: '#1e40af', padding: '8px 16px', borderRadius: '20px', fontWeight: '600', fontSize: '0.9rem' }}>
          Total Jobs: {filteredJobs.length} {filteredJobs.length !== jobs.name && `(of ${jobs.length})`}
        </div>
      </div>

      {/* Filter Input Fields */}
      <div style={{ display: 'flex', gap: '12px', margin: '20px 0', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Filter by skill (e.g., Python, React)..."
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value)}
          style={{ flex: 1, minWidth: '220px', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <input
          type="text"
          placeholder="Filter by YoE (e.g., 3+, 10+ years)..."
          value={yoeFilter}
          onChange={(e) => setYoeFilter(e.target.value)}
          style={{ flex: 1, minWidth: '220px', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
        />
      </div>

      {/* Job Cards List */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {filteredJobs.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>No matching jobs found.</p>
        ) : (
          filteredJobs.map((job) => (
            <div key={job.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', background: '#fff' }}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '1.25rem' }}>{job.job_title}</h2>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#4a5568' }}>{job.company}</h3>
              <p style={{ margin: '4px 0' }}><strong>Experience:</strong> {job.yoe}</p>
              <p style={{ margin: '4px 0' }}><strong>Skills:</strong> {job.skills}</p>
              {job.apply_link && job.apply_link !== "Not specified" && (
                <a
                  href={job.apply_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    marginTop: '12px',
                    padding: '8px 16px',
                    background: '#2563eb',
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: '6px'
                  }}
                >
                  Apply Now
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}