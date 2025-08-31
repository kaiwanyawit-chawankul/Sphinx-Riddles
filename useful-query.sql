Update riddles set used = false 

SELECT answer_text, COUNT(answer_text) FROM riddles GROUP BY answer_text HAVING COUNT(answer_text) > 1

select * from riddles where answer_text='Legacy code'
