FROM php:8.3-apache

RUN apt-get update \
    && apt-get install -y --no-install-recommends libcurl4-openssl-dev libonig-dev \
    && docker-php-ext-install curl mbstring pdo_mysql \
    && a2enmod headers rewrite \
    && rm -rf /var/lib/apt/lists/*

COPY railway/php.ini /usr/local/etc/php/conf.d/asistigo.ini
COPY railway/apache-asistigo.conf /etc/apache2/conf-available/asistigo.conf
COPY railway/start-apache.sh /usr/local/bin/start-asistigo
COPY backend /var/www/html/backend

RUN a2enconf asistigo \
    && chmod +x /usr/local/bin/start-asistigo \
    && mkdir -p /var/www/html/backend/uploads/chat-ia \
    && chown -R www-data:www-data /var/www/html/backend/uploads

EXPOSE 8080

CMD ["start-asistigo"]

