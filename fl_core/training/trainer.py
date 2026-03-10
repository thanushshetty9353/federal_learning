import torch
import torch.nn as nn
from utils.logger import logger


def train(model, trainloader, epochs=1):

    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    criterion = nn.CrossEntropyLoss()

    model.train()

    for epoch in range(epochs):

        for X, y in trainloader:

            optimizer.zero_grad()

            outputs = model(X)

            loss = criterion(outputs, y)

            loss.backward()

            optimizer.step()

    logger.info("Local training completed")

    return model


def evaluate(model, loader):

    criterion = nn.CrossEntropyLoss()
    model.eval()

    loss = 0
    correct = 0
    total = 0

    with torch.no_grad():

        for X, y in loader:

            outputs = model(X)

            l = criterion(outputs, y)
            loss += l.item()

            _, predicted = torch.max(outputs, 1)

            total += y.size(0)
            correct += (predicted == y).sum().item()

    accuracy = correct / total

    return loss / len(loader), accuracy