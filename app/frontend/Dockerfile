FROM nginx:alpine

# copy file html, css, js ทั้งหมดในโฟลเดอร์ frontend 
# ไปยังโฟลเดอร์ที่ nginx ใช้เสิร์ฟไฟล์พื้นฐาน
COPY index.html /usr/share/nginx/html/index.html
COPY style.css /usr/share/nginx/html/style.css
COPY script.js /usr/share/nginx/html/script.js
COPY api.js /usr/share/nginx/html/api.js
COPY config.js /usr/share/nginx/html/config.js

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]