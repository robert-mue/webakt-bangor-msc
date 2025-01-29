with open('doc1.html', 'w') as fw:
    with open('Statement.js', 'r') as fr:
        fw.write('<html></head>')
        # styling goes here...
        fw.write('</head><body>')
        for line in fr:
            if line[0:2] == '//':
                if line[2] == 'C':
                    fw.write('<h1>' + line[4:len(line)] + '</h1>')
                elif line[2] == 'P':
                    fw.write('<h2 class="properties">Properties</h2><table style="border:solid 1px black;border-collapse:collapse;">')
                elif line[2] == 'M':
                    fw.write('</table><h2 class="methods">Methods</h2><table style="border:solid 1px black;border-collapse:collapse;">')
                elif line[2] == '1':
                    fw.write('<tr><td class="table_item" style="width:250px;border:1px solid black;padding:3px;">' + line[4:len(line)] + '</td>')
                elif line[2] == '2':
                    fw.write('<td class="table_text" style="width:600px;border:1px solid black;padding:3px;">' + line[4:len(line)] +'</td></tr>')
                elif line[2] == 'F':
                    fw.write('<span class="function">' + line[4:len(line)] +'</span><br/>')
                elif line[2] == 'c':
                    fw.write('<span class="comment">' + line[4:len(line)] +'</span>')
        fw.write('</table></body></html>')

