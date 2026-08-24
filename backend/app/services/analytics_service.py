from app.schemas.analytics import AnalyticsOut, PlacementTrendPoint, SalaryTrendPoint, ScoreCategory, SkillGrowthPoint


def get_analytics() -> AnalyticsOut:
    return AnalyticsOut(
        skills_growth=[
            SkillGrowthPoint(skill="Coding", current=78, benchmark=64),
            SkillGrowthPoint(skill="Aptitude", current=71, benchmark=60),
            SkillGrowthPoint(skill="Communication", current=66, benchmark=68),
            SkillGrowthPoint(skill="Logical Reasoning", current=74, benchmark=62),
            SkillGrowthPoint(skill="System Design", current=52, benchmark=58),
            SkillGrowthPoint(skill="Academics", current=84, benchmark=70),
        ],
        salary_trend=[
            SalaryTrendPoint(date="Mar 2026", salary_lpa=5.8),
            SalaryTrendPoint(date="Apr 2026", salary_lpa=6.0),
            SalaryTrendPoint(date="May 2026", salary_lpa=6.2),
            SalaryTrendPoint(date="Jun 2026", salary_lpa=6.4),
            SalaryTrendPoint(date="Jul 2026", salary_lpa=6.8),
            SalaryTrendPoint(date="Aug 2026", salary_lpa=7.1),
        ],
        placement_trend=[
            PlacementTrendPoint(date="Mar 2026", probability=61),
            PlacementTrendPoint(date="Apr 2026", probability=65),
            PlacementTrendPoint(date="May 2026", probability=68),
            PlacementTrendPoint(date="Jun 2026", probability=70),
            PlacementTrendPoint(date="Jul 2026", probability=74),
            PlacementTrendPoint(date="Aug 2026", probability=78),
        ],
        score_categories=[
            ScoreCategory(label="Coding", value=78),
            ScoreCategory(label="Aptitude", value=71),
            ScoreCategory(label="Logical Reasoning", value=74),
            ScoreCategory(label="Communication", value=66),
            ScoreCategory(label="Extracurricular", value=58),
            ScoreCategory(label="Leadership", value=52),
        ],
    )
