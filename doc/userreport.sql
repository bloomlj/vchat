select org.name,score from score 
left join org on org.id = score.org_id
where  uid = 'oMR8gsycPJgCn2PH0RVAvlPd3oCc'  
order by score desc
