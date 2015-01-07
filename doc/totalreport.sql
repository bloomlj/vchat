select  org.name,sum(score) as totalscore  from score
left join org on score.org_id = org.id
group by org_id
order by totalscore desc