from app.schemas.recommendations import RecommendationsOut, RecommendedCompany, RecommendedSkill


def get_recommendations() -> RecommendationsOut:
    return RecommendationsOut(
        companies=[
            RecommendedCompany(
                id="nimbus", name="Nimbus Systems", industry="Cloud Infrastructure", fit_score=94,
                salary_range_lpa=(7.5, 9.8),
                required_skills=["Data Structures", "System Design", "Go", "Kubernetes"],
                matched_skills=["Data Structures", "System Design"],
                logo_initial="N",
            ),
            RecommendedCompany(
                id="quanta", name="Quanta Analytics", industry="Data & AI", fit_score=89,
                salary_range_lpa=(6.8, 8.6),
                required_skills=["Python", "SQL", "Machine Learning", "Statistics"],
                matched_skills=["Python", "SQL", "Statistics"],
                logo_initial="Q",
            ),
            RecommendedCompany(
                id="ledgerly", name="Ledgerly", industry="Fintech", fit_score=82,
                salary_range_lpa=(6.2, 7.9),
                required_skills=["Java", "Spring Boot", "System Design", "SQL"],
                matched_skills=["SQL", "System Design"],
                logo_initial="L",
            ),
        ],
        skills=[
            RecommendedSkill(id="system-design", skill="System Design", current=52, target=75, priority="High", suggestion="Study load balancing, caching, and database sharding patterns."),
            RecommendedSkill(id="communication", skill="Communication", current=66, target=80, priority="High", suggestion="Practice structured answers using the STAR method in mock interviews."),
            RecommendedSkill(id="distributed-systems", skill="Distributed Systems", current=41, target=65, priority="Medium", suggestion="Build a small project using message queues and eventual consistency."),
            RecommendedSkill(id="aptitude", skill="Quantitative Aptitude", current=71, target=82, priority="Medium", suggestion="Timed practice sets on permutations, probability, and data interpretation."),
        ],
    )
