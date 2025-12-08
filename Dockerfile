#========================================================================
# Copyright Universidade Federal do Espirito Santo (Ufes)
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.
# 
# This program is released under license GNU GPL v3+ license.
#
#========================================================================

FROM amazon/dynamodb-local:latest

USER root

RUN yum install -y python3 python3-pip
RUN pip3 install boto3

COPY awscliv2/ ./awscliv2/
COPY tables/ ./tables/
COPY scripts_tables/ ./scripts_tables/

RUN ./awscliv2/aws/install

WORKDIR /scripts