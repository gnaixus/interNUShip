
// internship detail page 

{daysRemaining <= 0 ? 'Application Closed' : `${daysRemaining} days left`}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{ 
        background: 'rgba(30, 41, 59, 0.6)', 
        padding: '1.5rem 0',
        borderBottom: '1px solid var(--glass-border)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--purple-light)', fontSize: '1.5rem', fontWeight: '600' }}>
                {internship.applicationCount}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Applications</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--purple-light)', fontSize: '1.5rem', fontWeight: '600' }}>
                {internship.reviews ? `${averageRating.toFixed(1)}⭐` : 'N/A'}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Average Rating</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--purple-light)', fontSize: '1.5rem', fontWeight: '600' }}>
                {internship.reviews ? internship.reviews.length : 0}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Reviews</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--purple-light)', fontSize: '1.5rem', fontWeight: '600' }}>
                {internship.companySize}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Company Size</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section style={{ 
        background: 'var(--glass-bg)', 
        borderBottom: '1px solid var(--glass-border)',
        position: 'sticky',
        top: '73px',
        zIndex: 50
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div className={styles.tabsContainer}>
            {[
              { id: 'overview', label: 'Overview', icon: '📋' },
              { id: 'requirements', label: 'Requirements', icon: '✅' },
              { id: 'benefits', label: 'Benefits', icon: '🎁' },
              { id: 'company', label: 'Company', icon: '🏢' },
              { id: 'process', label: 'Application Process', icon: '📝' },
              { id: 'reviews', label: 'Reviews', icon: '⭐' }
            ].map(tab => (
              <button
                key={tab.id}
                className={`${styles.categoryChip} ${activeTab === tab.id ? styles.active : ''}`}
                onClick={() => setActiveTab(tab.id)}
                style={{ margin: '0.5rem 0.25rem' }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section style={{ padding: '3rem 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
            
            {/* Main Content */}
            <div>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className={styles.profileCard}>
                  <h2 style={{ color: 'var(--text-primary)', marginBottom: '2rem', fontSize: '1.75rem' }}>
                    📋 Position Overview
                  </h2>
                  
                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Description</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                      {internship.description}
                    </p>
                    
                    {internship.fullDescription && (
                      <div style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        {internship.fullDescription.split('\n\n').map((paragraph, index) => (
                          <p key={index} style={{ marginBottom: '1rem' }}>{paragraph}</p>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Required Skills</h3>
                    <div className={styles.skillsTags}>
                      {internship.skills.map(skill => (
                        <span key={skill} className={styles.skillTag}>{skill}</span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    <div>
                      <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>📍 Location</h4>
                      <p style={{ color: 'var(--text-secondary)' }}>{internship.location}</p>
                    </div>
                    <div>
                      <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>⏱️ Duration</h4>
                      <p style={{ color: 'var(--text-secondary)' }}>{internship.duration}</p>
                    </div>
                    <div>
                      <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>💰 Stipend</h4>
                      <p style={{ color: 'var(--text-secondary)' }}>{internship.stipend}</p>
                    </div>
                    <div>
                      <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>🏭 Industry</h4>
                      <p style={{ color: 'var(--text-secondary)' }}>{internship.industry}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Requirements Tab */}
              {activeTab === 'requirements' && (
                <div className={styles.profileCard}>
                  <h2 style={{ color: 'var(--text-primary)', marginBottom: '2rem', fontSize: '1.75rem' }}>
                    ✅ Requirements & Qualifications
                  </h2>
                  
                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Required Qualifications</h3>
                    <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                      {internship.requirements.map((req, index) => (
                        <li key={index} style={{ marginBottom: '0.5rem', listStyle: 'none', position: 'relative', paddingLeft: '1.5rem' }}>
                          <span style={{ position: 'absolute', left: 0, color: 'var(--success)' }}>✓</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {internship.preferredQualifications && (
                    <div>
                      <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Preferred Qualifications</h3>
                      <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        {internship.preferredQualifications.map((pref, index) => (
                          <li key={index} style={{ marginBottom: '0.5rem', listStyle: 'none', position: 'relative', paddingLeft: '1.5rem' }}>
                            <span style={{ position: 'absolute', left: 0, color: 'var(--warning)' }}>⭐</span>
                            {pref}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Benefits Tab */}
              {activeTab === 'benefits' && (
                <div className={styles.profileCard}>
                  <h2 style={{ color: 'var(--text-primary)', marginBottom: '2rem', fontSize: '1.75rem' }}>
                    🎁 Benefits & Perks
                  </h2>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                    {internship.benefits.map((benefit, index) => (
                      <div key={index} style={{
                        padding: '1rem',
                        background: 'rgba(139, 92, 246, 0.1)',
                        borderRadius: 'var(--border-radius)',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}>
                        <span style={{ fontSize: '1.5rem' }}>🎁</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Company Tab */}
              {activeTab === 'company' && internship.companyInfo && (
                <div className={styles.profileCard}>
                  <h2 style={{ color: 'var(--text-primary)', marginBottom: '2rem', fontSize: '1.75rem' }}>
                    🏢 About {internship.companyInfo.name}
                  </h2>
                  
                  <div style={{ marginBottom: '2rem' }}>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '1.1rem' }}>
                      {internship.companyInfo.description}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div>
                      <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>📅 Founded</h4>
                      <p style={{ color: 'var(--text-secondary)' }}>{internship.companyInfo.founded}</p>
                    </div>
                    <div>
                      <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>👥 Employees</h4>
                      <p style={{ color: 'var(--text-secondary)' }}>{internship.companyInfo.employees}</p>
                    </div>
                    <div>
                      <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>📍 Headquarters</h4>
                      <p style={{ color: 'var(--text-secondary)' }}>{internship.companyInfo.headquarters}</p>
                    </div>
                    <div>
                      <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>🌐 Website</h4>
                      <a href={internship.companyInfo.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--purple-light)' }}>
                        Visit Website
                      </a>
                    </div>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Core Values</h3>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      {internship.companyInfo.values.map(value => (
                        <span key={value} style={{
                          background: 'rgba(59, 130, 246, 0.2)',
                          color: '#93c5fd',
                          padding: '0.5rem 1rem',
                          borderRadius: '1.5rem',
                          fontSize: '0.875rem',
                          fontWeight: '500'
                        }}>
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Tech Stack</h3>
                    <div className={styles.skillsTags}>
                      {internship.companyInfo.techStack.map(tech => (
                        <span key={tech} className={styles.skillTag}>{tech}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Company Perks</h3>
                    <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                      {internship.companyInfo.perks.map((perk, index) => (
                        <li key={index} style={{ marginBottom: '0.5rem', listStyle: 'none', position: 'relative', paddingLeft: '1.5rem' }}>
                          <span style={{ position: 'absolute', left: 0, color: 'var(--success)' }}>🎯</span>
                          {perk}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Application Process Tab */}
              {activeTab === 'process' && internship.applicationProcess && (
                <div className={styles.profileCard}>
                  <h2 style={{ color: 'var(--text-primary)', marginBottom: '2rem', fontSize: '1.75rem' }}>
                    📝 Application Process
                  </h2>
                  
                  <div style={{ position: 'relative' }}>
                    {internship.applicationProcess.map((step, index) => (
                      <div key={step.step} style={{
                        display: 'flex',
                        gap: '1.5rem',
                        marginBottom: index < internship.applicationProcess.length - 1 ? '2rem' : '0',
                        position: 'relative'
                      }}>
                        {/* Step Number */}
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'var(--accent-gradient)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '600',
                          flexShrink: 0,
                          position: 'relative',
                          zIndex: 2
                        }}>
                          {step.step}
                        </div>
                        
                        {/* Connecting Line */}
                        {index < internship.applicationProcess.length - 1 && (
                          <div style={{
                            position: 'absolute',
                            left: '19px',
                            top: '40px',
                            width: '2px',
                            height: '2rem',
                            background: 'var(--glass-border)',
                            zIndex: 1
                          }} />
                        )}

                        {/* Step Content */}
                        <div style={{ flex: 1 }}>
                          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                            {step.title}
                          </h3>
                          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: '1.5' }}>
                            {step.description}
                          </p>
                          <span style={{ 
                            color: 'var(--text-muted)', 
                            fontSize: '0.875rem',
                            background: 'rgba(139, 92, 246, 0.1)',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '1rem'
                          }}>
                            ⏱️ {step.duration}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    marginTop: '2rem',
                    padding: '1.5rem',
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid rgba(59, 130, 246, 0.2)'
                  }}>
                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>💡 Pro Tips</h4>
                    <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0, paddingLeft: '1rem' }}>
                      <li>Prepare your portfolio and GitHub profile in advance</li>
                      <li>Practice coding problems similar to the company's tech stack</li>
                      <li>Research the company's recent projects and values</li>
                      <li>Prepare thoughtful questions about the role and team</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div className={styles.profileCard}>
                  <h2 style={{ color: 'var(--text-primary)', marginBottom: '2rem', fontSize: '1.75rem' }}>
                    ⭐ Intern Reviews ({internship.reviews ? internship.reviews.length : 0})
                  </h2>
                  
                  {internship.reviews && internship.reviews.length > 0 ? (
                    <>
                      {/* Reviews Summary */}
                      <div style={{
                        padding: '1.5rem',
                        background: 'rgba(139, 92, 246, 0.1)',
                        borderRadius: 'var(--border-radius)',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        marginBottom: '2rem',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                          {averageRating.toFixed(1)} ⭐
                        </div>
                        <div style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600' }}>
                          Average Rating
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                          Based on {internship.reviews.length} verified intern reviews
                        </div>
                      </div>

                      {/* Individual Reviews */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {internship.reviews.map(review => (
                          <div key={review.id} style={{
                            padding: '1.5rem',
                            background: 'rgba(255, 255, 255, 0.02)',
                            borderRadius: 'var(--border-radius-lg)',
                            border: '1px solid var(--glass-border)'
                          }}>
                            {/* Review Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{
                                  width: '50px',
                                  height: '50px',
                                  borderRadius: '50%',
                                  background: 'var(--accent-gradient)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontWeight: '600'
                                }}>
                                  {review.author.avatar}
                                </div>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>
                                      {review.author.name}
                                    </h4>
                                    {review.verified && (
                                      <span style={{
                                        background: 'rgba(16, 185, 129, 0.2)',
                                        color: '#10b981',
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '0.75rem',
                                        fontSize: '0.75rem',
                                        fontWeight: '600'
                                      }}>
                                        ✓ Verified
                                      </span>
                                    )}
                                  </div>
                                  <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                                    {review.author.year} • {review.author.major} • {review.author.internshipPeriod}
                                  </p>
                                </div>
                              </div>
                              
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>
                                  {renderStars(review.rating)}
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>

                            {/* Review Title */}
                            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.1rem' }}>
                              {review.title}
                            </h3>

                            {/* Review Content */}
                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1rem' }}>
                              {review.content}
                            </p>

                            {/* Pros and Cons */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
                              <div>
                                <h5 style={{ color: 'var(--success)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                  ✅ Pros
                                </h5>
                                <ul style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', paddingLeft: '1rem', margin: 0 }}>
                                  {review.pros.map((pro, index) => (
                                    <li key={index} style={{ marginBottom: '0.25rem' }}>{pro}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h5 style={{ color: 'var(--warning)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                  ⚠️ Cons
                                </h5>
                                <ul style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', paddingLeft: '1rem', margin: 0 }}>
                                  {review.cons.map((con, index) => (
                                    <li key={index} style={{ marginBottom: '0.25rem' }}>{con}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* Review Footer */}
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              paddingTop: '1rem',
                              borderTop: '1px solid var(--glass-border)',
                              fontSize: '0.875rem',
                              color: 'var(--text-muted)'
                            }}>
                              <span>👍 {review.helpful} people found this helpful</span>
                              <button style={{
                                background: 'none',
                                border: '1px solid var(--glass-border)',
                                color: 'var(--text-primary)',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                              }}>
                                Helpful
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                      <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No Reviews Yet</h3>
                      <p>Be the first to share your internship experience!</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div>
              {/* Quick Apply Card */}
              <div className={styles.profileCard} style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>🚀 Quick Apply</h3>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Application Deadline</span>
                    <span style={{ color: daysRemaining <= 7 ? 'var(--danger)' : 'var(--text-primary)', fontWeight: '600', fontSize: '0.875rem' }}>
                      {daysRemaining <= 0 ? 'Closed' : `${daysRemaining} days left`}
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '6px',
                    background: 'var(--glass-border)',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${Math.max(0, Math.min(100, (30 - daysRemaining) / 30 * 100))}%`,
                      height: '100%',
                      background: daysRemaining <= 7 ? 'var(--danger)' : daysRemaining <= 14 ? 'var(--warning)' : 'var(--success)',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <button
                    onClick={() => handleAction('apply')}
                    className={styles.ctaPrimary}
                    style={{ width: '100%' }}
                    disabled={daysRemaining <= 0}
                  >
                    {daysRemaining <= 0 ? 'Application Closed' : 'Apply Now'}
                  </button>
                  <button
                    onClick={() => handleAction('bookmark')}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: isBookmarked ? 'rgba(245, 158, 11, 0.2)' : 'var(--glass-bg)',
                      border: `1px solid ${isBookmarked ? '#f59e0b' : 'var(--glass-border)'}`,
                      color: isBookmarked ? '#f59e0b' : 'var(--text-primary)',
                      borderRadius: 'var(--border-radius)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}
                  >
                    {isBookmarked ? '🔖 Bookmarked' : '🔖 Bookmark'}
                  </button>
                </div>
              </div>

              {/* Similar Internships */}
              {internship.similarInternships && (
                <div className={styles.profileCard}>
                  <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>🔍 Similar Internships</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {internship.similarInternships.map(similar => (
                      <div key={similar.id} style={{
                        padding: '1rem',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: 'var(--border-radius)',
                        border: '1px solid var(--glass-border)',
                        cursor: 'pointer',
                        transition: 'var(--transition)'
                      }}
                      onClick={() => navigate(`/internships/${similar.id}`)}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
                      onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.02)'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <h4 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '0.9rem' }}>
                            {similar.title}
                          </h4>
                          {user && (
                            <span style={{
                              background: 'linear-gradient(135deg, var(--success) 0%, #059669 100%)',
                              color: 'white',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '0.75rem',
                              fontSize: '0.7rem',
                              fontWeight: '600'
                            }}>
                              {similar.match}% Match
                            </span>
                          )}
                        </div>
                        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.8rem' }}>
                          {similar.company}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2>Ready to Take the Next Step?</h2>
          <p>Join thousands of students who have launched their careers through internships</p>
          {user ? (
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                className={styles.ctaPrimary}
                onClick={() => handleAction('apply')}
                disabled={daysRemaining <= 0}
              >
                {daysRemaining <= 0 ? 'Application Closed' : 'Apply Now'}
              </button>
              <button 
                className={styles.ctaSecondary}
                onClick={() => navigate('/internships')}
              >
                Browse More Internships
              </button>
            </div>
          ) : (
            <button className={styles.ctaPrimary} onClick={() => navigate('/signup')}>
              Sign Up to Apply
            </button>
          )}
        </div>
      </section>
    </div>
  );
};

export default InternshipDetails;import React, { useState, useEffect } from 'react';
import { useAuth } from './auth/AuthContext';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import styles from '../styles/Home.module.css';
import DataService from '../services/dataService';

const InternshipDetails = () => {
  const { user, isGuest, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Navigation items
  const navigationItems = [
    { path: '/home', label: 'Home', icon: '🏠' },
    { path: '/internships', label: 'Browse', icon: '🔍' },
    { path: '/applications', label: 'Applications', icon: '📝' },
    { path: '/bookmarks', label: 'Bookmarks', icon: '🔖' }
  ];

  // Dummy detailed internship data
  const dummyInternshipDetails = {
    1: {
      id: 1,
      title: 'Software Engineering Intern',
      company: 'TechCorp Singapore',
      logo: '💻',
      location: 'Singapore',
      stipend: 'S$1,200/month',
      duration: '3 months',
      category: 'technology',
      match: 92,
      deadline: '15/06/2025',
      postedDate: '01/05/2025',
      applicationCount: 45,
      companySize: '201-500 employees',
      industry: 'Technology',
      source: 'linkedin',
      description: 'Join our dynamic team as a Software Engineering Intern and work on cutting-edge web applications that impact thousands of users. You\'ll collaborate with senior developers, participate in code reviews, and contribute to real-world projects using modern technologies like React, Node.js, and cloud platforms.',
      fullDescription: `We are looking for a passionate Software Engineering Intern to join our growing development team. This internship offers hands-on experience with modern web technologies and the opportunity to work on projects that directly impact our user base of over 100,000 customers.

Key Responsibilities:
• Develop and maintain web applications using React.js and Node.js
• Collaborate with cross-functional teams to define, design, and ship new features
• Write clean, maintainable code following best practices
• Participate in code reviews and technical discussions
• Debug and resolve software defects
• Contribute to technical documentation
• Assist in database design and optimization

What You'll Learn:
• Full-stack web development with modern frameworks
• Agile development methodologies (Scrum)
• Version control with Git and collaborative development
• Cloud technologies (AWS, Docker)
• Database management (PostgreSQL, Redis)
• Test-driven development practices
• Performance optimization techniques

Career Growth:
This internship is designed to provide comprehensive exposure to software engineering practices. Many of our former interns have received full-time offers and are now senior developers in our team. You'll have a dedicated mentor and quarterly review sessions to track your progress.`,
      requirements: [
        'Currently pursuing Computer Science or related field (Year 2 or above)',
        'Strong foundation in JavaScript and understanding of ES6+ features',
        'Experience with React.js or similar frontend frameworks',
        'Basic knowledge of Node.js and Express.js',
        'Familiarity with Git version control',
        'Understanding of RESTful APIs and HTTP protocols',
        'Good problem-solving skills and attention to detail',
        'Excellent communication and teamwork abilities',
        'Passion for learning new technologies'
      ],
      preferredQualifications: [
        'Experience with TypeScript',
        'Knowledge of database systems (SQL/NoSQL)',
        'Familiarity with cloud platforms (AWS/GCP/Azure)',
        'Understanding of software testing frameworks',
        'Previous internship or project experience'
      ],
      benefits: [
        'Competitive monthly stipend of S$1,200',
        'Flexible working hours (core hours: 10 AM - 4 PM)',
        'Hybrid work arrangement (3 days office, 2 days WFH)',
        'Free meals and snacks',
        'Mentorship from senior engineers',
        'Learning budget for courses and certifications',
        'Access to latest development tools and software',
        'Team building activities and company events',
        'Potential for full-time conversion',
        'Professional development workshops'
      ],
      skills: ['React', 'Node.js', 'JavaScript', 'MongoDB', 'Git', 'AWS', 'TypeScript', 'SQL'],
      companyInfo: {
        name: 'TechCorp Singapore',
        founded: '2018',
        employees: '250+',
        website: 'https://techcorp.sg',
        headquarters: 'Marina Bay, Singapore',
        industry: 'Technology Solutions',
        description: 'TechCorp Singapore is a leading technology company specializing in enterprise software solutions. We serve over 500 businesses across Southeast Asia and are known for our innovative approach to solving complex business problems.',
        values: ['Innovation', 'Collaboration', 'Excellence', 'Integrity'],
        techStack: ['React', 'Node.js', 'Python', 'AWS', 'PostgreSQL', 'Docker', 'Kubernetes'],
        perks: [
          'Flexible working arrangements',
          'Professional development budget',
          'Health and wellness programs',
          'Modern office with game room',
          'Free parking and transport allowance',
          'Regular team outings and events'
        ]
      },
      applicationProcess: [
        {
          step: 1,
          title: 'Application Review',
          description: 'Submit your resume and cover letter through our portal',
          duration: '3-5 business days'
        },
        {
          step: 2,
          title: 'Technical Assessment',
          description: 'Complete a coding challenge (JavaScript/React)',
          duration: '2-3 hours to complete'
        },
        {
          step: 3,
          title: 'Technical Interview',
          description: 'Video interview with our engineering team',
          duration: '45-60 minutes'
        },
        {
          step: 4,
          title: 'Final Interview',
          description: 'Culture fit interview with team lead and HR',
          duration: '30-45 minutes'
        },
        {
          step: 5,
          title: 'Offer & Onboarding',
          description: 'Receive offer and complete onboarding process',
          duration: '1-2 weeks'
        }
      ],
      reviews: [
        {
          id: 1,
          author: {
            name: 'Sarah Chen',
            avatar: 'SC',
            year: 'Year 4',
            major: 'Computer Science',
            internshipPeriod: 'Summer 2024'
          },
          rating: 5,
          title: 'Amazing learning experience!',
          content: 'Had an incredible 3 months at TechCorp! The mentorship was outstanding - my supervisor gave me meaningful projects from day one. I worked on a customer dashboard that\'s now used by thousands of users. The team was super welcoming and I learned so much about full-stack development. Definitely recommend to anyone looking for hands-on experience!',
          pros: ['Great mentorship', 'Real project impact', 'Flexible hours', 'Learning opportunities'],
          cons: ['Fast-paced environment might be overwhelming initially'],
          helpful: 23,
          createdAt: '2024-08-15',
          verified: true
        },
        {
          id: 2,
          author: {
            name: 'Marcus Wong',
            avatar: 'MW',
            year: 'Year 3',
            major: 'Information Systems',
            internshipPeriod: 'Winter 2023'
          },
          rating: 4,
          title: 'Solid internship with good growth potential',
          content: 'Really enjoyed my time here. The work was challenging but rewarding. Got to work with modern tech stack and learned a lot about scalable web development. The office culture is great - everyone is helpful and collaborative. Only downside was that some processes could be more streamlined, but that\'s expected in a growing company.',
          pros: ['Modern tech stack', 'Collaborative culture', 'Good stipend', 'Office perks'],
          cons: ['Some processes need improvement', 'Can be demanding during crunch periods'],
          helpful: 18,
          createdAt: '2024-01-20',
          verified: true
        },
        {
          id: 3,
          author: {
            name: 'Priya Sharma',
            avatar: 'PS',
            year: 'Year 2',
            major: 'Computer Engineering',
            internshipPeriod: 'Summer 2023'
          },
          rating: 5,
          title: 'Perfect for beginners!',
          content: 'As someone with limited industry experience, TechCorp was the perfect place to start. They have a structured onboarding process and don\'t expect you to know everything from day one. My mentor was patient and always available for questions. I built two features that went into production - such a confidence boost! The company also sponsored my AWS certification.',
          pros: ['Beginner-friendly', 'Structured onboarding', 'Certification support', 'Patient mentors'],
          cons: ['Limited exposure to backend systems initially'],
          helpful: 31,
          createdAt: '2023-08-10',
          verified: true
        },
        {
          id: 4,
          author: {
            name: 'David Kim',
            avatar: 'DK',
            year: 'Graduate',
            major: 'Software Engineering',
            internshipPeriod: 'Winter 2024'
          },
          rating: 4,
          title: 'Great stepping stone for career',
          content: 'TechCorp internship was instrumental in landing my full-time role at another company. The experience I gained here, especially in React and cloud technologies, made me stand out in interviews. The projects are challenging enough to put on your portfolio. Work-life balance is good and the team genuinely cares about your growth.',
          pros: ['Portfolio-worthy projects', 'Career advancement', 'Work-life balance', 'Skill development'],
          cons: ['Limited international project exposure'],
          helpful: 15,
          createdAt: '2024-02-28',
          verified: true
        }
      ],
      similarInternships: [
        { id: 2, title: 'Backend Developer Intern', company: 'CloudTech Solutions', match: 89 },
        { id: 3, title: 'Frontend Developer Intern', company: 'Digital Innovations Lab', match: 85 },
        { id: 4, title: 'Mobile App Developer Intern', company: 'MobileTech Singapore', match: 83 }
      ]
    }
    // Add more dummy data for other internship IDs if needed
  };

  // Load internship data
  useEffect(() => {
    const loadInternship = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Try to get detailed data first
        const detailedData = dummyInternshipDetails[parseInt(id)];
        
        if (detailedData) {
          setInternship(detailedData);
        } else {
          // Fallback to basic internship data
          const response = await DataService.getInternshipById(id);
          if (response.success) {
            setInternship(response.data);
          } else {
            setError('Internship not found');
          }
        }
      } catch (err) {
        console.error('Error loading internship:', err);
        setError('Failed to load internship details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadInternship();
    }
  }, [id]);

  // Handle actions
  const handleAction = async (action) => {
    switch (action) {
      case 'apply':
        if (user) {
          navigate(`/apply/${internship.id}`);
        } else {
          setShowApplyModal(true);
        }
        break;
      case 'bookmark':
        if (user) {
          try {
            await DataService.bookmarkInternship(user.id, internship.id, 'Saved from details page');
            setIsBookmarked(true);
            alert('Internship bookmarked successfully!');
          } catch (error) {
            alert('Failed to bookmark internship');
          }
        } else {
          setShowApplyModal(true);
        }
        break;
      case 'logout':
        logout();
        navigate('/login');
        break;
      default:
        break;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const [day, month, year] = dateString.split('/');
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate days remaining
  const getDaysRemaining = (deadline) => {
    const [day, month, year] = deadline.split('/');
    const deadlineDate = new Date(year, month - 1, day);
    const today = new Date();
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Render star rating
  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) {
    return (
      <div className={styles.homeContainer}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          color: 'var(--text-primary)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
            <p>Loading internship details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !internship) {
    return (
      <div className={styles.homeContainer}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          color: 'var(--text-primary)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h2>😕 Internship Not Found</h2>
            <p>{error || 'The internship you\'re looking for doesn\'t exist.'}</p>
            <button className={styles.ctaPrimary} onClick={() => navigate('/internships')}>
              Browse Other Internships
            </button>
          </div>
        </div>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(internship.deadline);
  const averageRating = internship.reviews ? 
    internship.reviews.reduce((acc, review) => acc + review.rating, 0) / internship.reviews.length : 0;

  return (
    <div className={styles.homeContainer}>
      {/* Header */}
      <div className={styles.userHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.userInfo}>
            {user && <span>👋 {user.full_name || user.email}</span>}
            {isGuest && <span>🔍 Browsing as Guest</span>}
            {!user && !isGuest && <span>💼 Internship Details</span>}
          </div>
          <ul className={styles.navItems}>
            {navigationItems.map(item => (
              <li key={item.path}>
                <button
                  className={`${styles.navLink} ${location.pathname === item.path ? styles.active : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.headerRight}>
          {user && (
            <>
              <button className={styles.profileBtn} onClick={() => navigate('/profile')}>Profile</button>
              <button className={styles.logoutBtn} onClick={() => handleAction('logout')}>Logout</button>
            </>
          )}
          {!user && (
            <>
              <button className={styles.loginBtn} onClick={() => navigate('/login')}>Login</button>
              <button className={styles.signupBtn} onClick={() => navigate('/signup')}>Sign Up</button>
            </>
          )}
        </div>
      </div>

      {/* Login Modal for Guests */}
      {showApplyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '2rem',
            backdropFilter: 'blur(10px)',
            textAlign: 'center',
            maxWidth: '400px'
          }}>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Login Required</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Please create an account or log in to apply for internships and bookmark opportunities.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                className={styles.ctaPrimary}
                onClick={() => navigate('/signup')}
              >
                Sign Up
              </button>
              <button
                className={styles.ctaSecondary}
                onClick={() => navigate('/login')}
              >
                Login
              </button>
            </div>
            <button
              onClick={() => setShowApplyModal(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                marginTop: '1rem'
              }}
            >
              Continue browsing
            </button>
          </div>
        </div>
      )}

      {/* Internship Header */}
      <section style={{ padding: '2rem 0', background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.1), rgba(236, 72, 153, 0.1))' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '2rem', flex: 1 }}>
              <div style={{
                fontSize: '4rem',
                width: '100px',
                height: '100px',
                borderRadius: 'var(--border-radius-lg)',
                background: 'var(--glass-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--glass-border)',
                backdropFilter: 'blur(10px)'
              }}>
                {internship.logo}
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={{
                  color: 'var(--text-primary)',
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  margin: '0 0 0.5rem 0',
                  lineHeight: '1.2'
                }}>
                  {internship.title}
                </h1>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '1.25rem',
                  margin: '0 0 1rem 0'
                }}>
                  {internship.company}
                </p>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                    <span>📍</span> {internship.location}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                    <span>💰</span> {internship.stipend}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                    <span>⏱️</span> {internship.duration}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                    <span>📅</span> Due {formatDate(internship.deadline)}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Match Score and Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-end' }}>
              {user && (
                <div style={{
                  background: 'linear-gradient(135deg, var(--success) 0%, #059669 100%)',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: 'var(--border-radius)',
                  fontWeight: '600',
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}>
                  {internship.match}% Match
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => handleAction('bookmark')}
                  style={{
                    background: isBookmarked ? 'rgba(245, 158, 11, 0.2)' : 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    color: isBookmarked ? '#f59e0b' : 'var(--text-primary)',
                    padding: '0.75rem',
                    borderRadius: 'var(--border-radius)',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    transition: 'var(--transition)'
                  }}
                >
                  {isBookmarked ? '🔖' : '🔖'}
                </button>
                <button
                  onClick={() => handleAction('apply')}
                  className={styles.ctaPrimary}
                  style={{ padding: '0.75rem 2rem' }}
                >
                  Apply Now
                </button>
              </div>
              
              {/* Deadline Warning */}
              {daysRemaining <= 7 && (
                <div style={{
                  background: daysRemaining <= 3 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: daysRemaining <= 3 ? '#ef4444' : '#f59e0b',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--border-radius)',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  border: `1px solid ${daysRemaining <= 3 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                }}></div>

// not done yet